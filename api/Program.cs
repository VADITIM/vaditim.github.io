using System.Threading.RateLimiting;

using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

using Portfolio.Api;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Unlock;

using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Comma-separated so the deployed API can also serve a local dev server during debugging.
var frontendOrigins = (builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var ipHashSalt = builder.Configuration["IpHashSalt"] ?? throw new InvalidOperationException("IpHashSalt is not configured.");
var adminApiKey = builder.Configuration["AdminApiKey"] ?? throw new InvalidOperationException("AdminApiKey is not configured.");

builder.Services.AddDbContext<CommentsDbContext>(options =>
{
    if (builder.Configuration["DbProvider"] == "SqlServer")
        // NOTE: the serverless tier auto-pauses when idle; the first request after a pause
        // fails with error 40613 while the database wakes, so retries are mandatory here.
        options.UseSqlServer(builder.Configuration.GetConnectionString("CommentsDb"),
            sqlServer => sqlServer.EnableRetryOnFailure(maxRetryCount: 8, maxRetryDelay: TimeSpan.FromSeconds(20), errorNumbersToAdd: null));
    else
        options.UseSqlite(builder.Configuration["SqliteFile"] ?? "Data Source=comments.db");
});

builder.Services.AddSignalR();
builder.Services.AddSingleton<UnlockSessionStore>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(frontendOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("post-comments", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromMinutes(10),
            QueueLimit = 0,
        }));

    options.AddPolicy("read-comments", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 60,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        }));

    options.AddPolicy("unlock", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(10),
            QueueLimit = 0,
        }));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CommentsDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.UseRateLimiter();

// Container Apps probes this; without a route here '/' 404s and the replica is killed as unhealthy.
app.MapGet("/", () => Results.Ok("ok"));

app.MapHub<UnlockHub>("/unlock-hub");

// Called by the phone after it opens the QR's URL. Claiming is single-use, so a
// replayed or guessed id gets the same 404 as one that never existed.
app.MapPost("/unlock/{sessionId}", async (string sessionId, UnlockSessionStore sessionStore, IHubContext<UnlockHub> hub) =>
{
    if (!UnlockSessionStore.IsWellFormedSessionId(sessionId) || !sessionStore.TryClaim(sessionId))
        return Results.NotFound("Session expired — reload the page on the big screen.");

    await hub.Clients.Group(UnlockHub.GroupName(sessionId)).SendAsync("unlocked");
    return Results.NoContent();
}).RequireRateLimiting("unlock");

var comments = app.MapGroup("/comments");

comments.MapGet("/", async (CommentsDbContext db) =>
{
    var visible = await db.Comments
        .Where(comment => !comment.IsHidden)
        .OrderByDescending(comment => comment.CreatedAtUtc)
        .Select(comment => CommentOutput.From(comment))
        .ToListAsync();
    return Results.Ok(visible);
}).RequireRateLimiting("read-comments");

// "No comment yet" is the normal case for a first-time visitor, so it answers 200 with a null
// body rather than 404 — a 404 here is indistinguishable from a real error in the browser console.
comments.MapGet("/mine", async (HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    var comment = visitorId is null
        ? null
        : await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);

    // Results.Json, not Results.Ok — the latter writes a zero-length body for a null value,
    // which is not valid JSON for the caller to parse.
    return Results.Json(comment is null ? null : CommentOutput.From(comment));
}).RequireRateLimiting("read-comments");

comments.MapPost("/", async (CommentInput input, HttpContext http, CommentsDbContext db) =>
{
    var text = input.Text.Trim();
    var name = input.Name.Trim();
    if (string.IsNullOrWhiteSpace(text) || text.Length > 280 || string.IsNullOrWhiteSpace(name) || name.Length > 40)
        return Results.BadRequest("Invalid comment.");
    if (string.IsNullOrWhiteSpace(input.Fingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var existingVisitorId = http.GetExistingVisitorId();
    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    if (existingVisitorId is not null && await db.Comments.AnyAsync(comment => comment.VisitorId == existingVisitorId))
        return Results.Conflict("You already have a comment.");

    if (await db.Comments.AnyAsync(comment => comment.FingerprintHash == fingerprintHash))
        return Results.Conflict("You already have a comment.");

    var sameIpDifferentFingerprint = await db.Comments
        .AnyAsync(comment => comment.IpHash == ipHash && comment.FingerprintHash != fingerprintHash);

    var visitorId = http.GetOrIssueVisitorCookie();

    var comment = new Comment
    {
        Name = name,
        Text = text,
        VisitorId = visitorId,
        FingerprintHash = fingerprintHash,
        IpHash = ipHash,
        CreatedAtUtc = DateTime.UtcNow,
        IsFlagged = sameIpDifferentFingerprint,
        FlagReason = sameIpDifferentFingerprint ? "SameIpDifferentFingerprint" : null,
        IsHidden = false,
    };

    db.Comments.Add(comment);
    await db.SaveChangesAsync();

    return Results.Created($"/comments/{comment.Id}", CommentOutput.From(comment));
}).RequireRateLimiting("post-comments");

comments.MapPut("/mine", async (CommentInput input, HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    if (visitorId is null)
        return Results.NotFound();

    var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
    if (comment is null)
        return Results.NotFound();

    var text = input.Text.Trim();
    var name = input.Name.Trim();
    if (string.IsNullOrWhiteSpace(text) || text.Length > 280 || string.IsNullOrWhiteSpace(name) || name.Length > 40)
        return Results.BadRequest("Invalid comment.");

    comment.Text = text;
    comment.Name = name;
    await db.SaveChangesAsync();
    return Results.Ok(CommentOutput.From(comment));
}).RequireRateLimiting("post-comments");

comments.MapDelete("/mine", async (HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    if (visitorId is null)
        return Results.NotFound();

    var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
    if (comment is null)
        return Results.NotFound();

    db.Comments.Remove(comment);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Wipes everything the API knows about the caller — their comment and their identity cookie —
// so the next visit is indistinguishable from a first one. Exposed as the classified section's
// "DELETE DATA" button; also the only practical way to re-test the single-use QR unlock.
app.MapDelete("/visitor", async (HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    if (visitorId is not null)
    {
        var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
        if (comment is not null)
        {
            db.Comments.Remove(comment);
            await db.SaveChangesAsync();
        }
    }

    http.ExpireVisitorCookie();
    return Results.NoContent();
}).RequireRateLimiting("unlock");

var admin = app.MapGroup("/admin/comments").AddEndpointFilter(async (context, next) =>
{
    var http = context.HttpContext;
    if (!http.Request.Headers.TryGetValue("X-Admin-Key", out var providedKey) || providedKey != adminApiKey)
        return Results.Unauthorized();
    return await next(context);
});

admin.MapGet("/", async (CommentsDbContext db, bool? flagged) =>
{
    var query = db.Comments.AsQueryable();
    if (flagged == true)
        query = query.Where(comment => comment.IsFlagged);
    var results = await query.OrderByDescending(comment => comment.CreatedAtUtc).ToListAsync();
    return Results.Ok(results);
});

admin.MapGet("/by-ip", async (CommentsDbContext db) =>
{
    var grouped = await db.Comments
        .GroupBy(comment => comment.IpHash)
        .Where(group => group.Count() > 1)
        .Select(group => new { IpHash = group.Key, Comments = group.ToList() })
        .ToListAsync();
    return Results.Ok(grouped);
});

admin.MapPatch("/{id:int}", async (int id, ModerationInput input, CommentsDbContext db) =>
{
    var comment = await db.Comments.FindAsync(id);
    if (comment is null)
        return Results.NotFound();

    if (input.IsHidden is { } isHidden)
        comment.IsHidden = isHidden;

    await db.SaveChangesAsync();
    return Results.Ok(CommentOutput.From(comment));
});

admin.MapDelete("/{id:int}", async (int id, CommentsDbContext db) =>
{
    var comment = await db.Comments.FindAsync(id);
    if (comment is null)
        return Results.NotFound();

    db.Comments.Remove(comment);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
