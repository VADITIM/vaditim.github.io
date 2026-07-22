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

    // Looser than comments on purpose: changing your mind about a rating is legitimate.
    options.AddPolicy("post-ratings", context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(10),
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
    // Migrations are generated against SqlServer, so they only apply there. Local SQLite
    // is a disposable dev database — delete the file to pick up a schema change.
    // The hosted database predates migrations: see api/DEPLOY.md for the one-time
    // baseline insert into __EFMigrationsHistory that stops Migrate() re-creating Comments.
    if (builder.Configuration["DbProvider"] == "SqlServer")
        db.Database.Migrate();
    else
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
    if (!UnlockSessionStore.IsWellFormedSessionId(sessionId))
        return Results.NotFound("Session expired — reload the page on the big screen.");

    var claimToken = sessionStore.TryClaim(sessionId);
    if (claimToken is null)
        return Results.NotFound("Session expired — reload the page on the big screen.");

    // The token rides the push to the desktop, which redeems it below. The phone never
    // sees it: the unlock belongs to the big screen, not to whatever scanned the code.
    await hub.Clients.Group(UnlockHub.GroupName(sessionId)).SendAsync("unlocked", claimToken);
    return Results.NoContent();
}).RequireRateLimiting("unlock");

// Called by the desktop once the hub pushes `unlocked`. Writing the row here rather
// than in the endpoint above is the whole point: this request carries the desktop's
// cookie and fingerprints, which is the identity the unlock has to stick to.
app.MapPost("/unlock/claim", async (UnlockClaimInput input, HttpContext http, CommentsDbContext db, UnlockSessionStore sessionStore) =>
{
    if (string.IsNullOrWhiteSpace(input.Fingerprint) || string.IsNullOrWhiteSpace(input.CoarseFingerprint))
        return Results.BadRequest("Missing fingerprint.");
    if (!sessionStore.TryRedeemClaimToken(input.ClaimToken))
        return Results.Unauthorized();

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    var existingVisitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);
    var visitorId = http.GetOrIssueVisitorCookie(existingVisitorId);

    var unlock = await db.VisitorUnlocks.FirstOrDefaultAsync(unlock => unlock.VisitorId == visitorId);
    if (unlock is null)
    {
        db.VisitorUnlocks.Add(new VisitorUnlock
        {
            VisitorId = visitorId,
            FingerprintHash = fingerprintHash,
            CoarseFingerprintHash = coarseFingerprintHash,
            IpHash = ipHash,
            UnlockedAtUtc = DateTime.UtcNow,
        });
    }
    else
    {
        // Re-scanning from a browser the row doesn't know yet: refresh the signals so
        // the next visit resolves on the exact path instead of the coarse one.
        unlock.FingerprintHash = fingerprintHash;
        unlock.CoarseFingerprintHash = coarseFingerprintHash;
        unlock.IpHash = ipHash;
    }

    await db.SaveChangesAsync();
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

    // Both Results.Ok and Results.Json write a zero-length body for a null value, which
    // is not valid JSON for the caller to parse — so the null case is written literally.
    return comment is null
        ? Results.Content("null", "application/json")
        : Results.Json(CommentOutput.From(comment));
}).RequireRateLimiting("read-comments");

comments.MapPost("/", async (CommentInput input, HttpContext http, CommentsDbContext db) =>
{
    var text = input.Text.Trim();
    var name = input.Name.Trim();
    if (string.IsNullOrWhiteSpace(text) || text.Length > 280 || string.IsNullOrWhiteSpace(name) || name.Length > 40)
        return Results.BadRequest("Invalid comment.");
    if (string.IsNullOrWhiteSpace(input.Fingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = input.CoarseFingerprint is null ? null : VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    // Resolve before minting: a visitor who has a rating or an unlock but no comment
    // must keep the id those rows are keyed to, or posting here would orphan them
    // behind a fresh cookie — and the duplicate check below would look at the wrong id.
    var existingVisitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);

    if (existingVisitorId is not null && await db.Comments.AnyAsync(comment => comment.VisitorId == existingVisitorId))
        return Results.Conflict("You already have a comment.");

    if (await db.Comments.AnyAsync(comment => comment.FingerprintHash == fingerprintHash))
        return Results.Conflict("You already have a comment.");

    var sameIpDifferentFingerprint = await db.Comments
        .AnyAsync(comment => comment.IpHash == ipHash && comment.FingerprintHash != fingerprintHash);

    var visitorId = http.GetOrIssueVisitorCookie(existingVisitorId);

    var comment = new Comment
    {
        Name = name,
        Text = text,
        VisitorId = visitorId,
        FingerprintHash = fingerprintHash,
        CoarseFingerprintHash = coarseFingerprintHash,
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

// The one edit a visitor gets. Resolving by cookie alone would lock out anyone whose
// fingerprint proves the comment is theirs, so this uses the same layered lookup as
// the unlock. The cap lives here and nowhere else — never trust the client to hide a button.
comments.MapPut("/mine", async (CommentInput input, HttpContext http, CommentsDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Fingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = input.CoarseFingerprint is null ? null : VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    var visitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);
    if (visitorId is null)
        return Results.NotFound();

    var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
    if (comment is null)
        return Results.NotFound();

    if (comment.EditCount >= 1)
        return Results.Conflict("You have already used your one edit.");

    var text = input.Text.Trim();
    var name = input.Name.Trim();
    if (string.IsNullOrWhiteSpace(text) || text.Length > 280 || string.IsNullOrWhiteSpace(name) || name.Length > 40)
        return Results.BadRequest("Invalid comment.");

    comment.Text = text;
    comment.Name = name;
    comment.EditCount++;
    await db.SaveChangesAsync();

    http.GetOrIssueVisitorCookie(visitorId);
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

var ratings = app.MapGroup("/ratings");

ratings.MapGet("/summary", async (CommentsDbContext db) =>
{
    var values = await db.Ratings.Select(rating => rating.Value).ToListAsync();
    var distribution = new int[5];
    foreach (var value in values)
    {
        if (value is >= 1 and <= 5) distribution[value - 1]++;
    }
    var average = values.Count == 0 ? 0 : values.Average();
    return Results.Ok(new RatingSummary(Math.Round(average, 2), values.Count, distribution));
}).RequireRateLimiting("read-comments");

// Mirrors /comments/mine: 200 with a null body, never a 404 — "hasn't voted yet" is
// the normal case and a 404 is indistinguishable from a real error in the console.
ratings.MapGet("/mine", async (HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    var rating = visitorId is null
        ? null
        : await db.Ratings.FirstOrDefaultAsync(rating => rating.VisitorId == visitorId);

    // Mirrors /comments/mine: 200 with a literal `null`, never an empty body and never
    // a 404 — "hasn't voted yet" is the normal case, not an error.
    return rating is null
        ? Results.Content("null", "application/json")
        : Results.Json(rating.Value);
}).RequireRateLimiting("read-comments");

// An upsert, not an insert-once: a visitor may change their mind, so a second vote
// updates the row instead of returning 409 the way a second comment would.
ratings.MapPost("/", async (RatingInput input, HttpContext http, CommentsDbContext db) =>
{
    if (input.Value is < 1 or > 5)
        return Results.BadRequest("Rating must be between 1 and 5.");
    if (string.IsNullOrWhiteSpace(input.Fingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = input.CoarseFingerprint is null ? null : VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    var existingVisitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);
    var visitorId = http.GetOrIssueVisitorCookie(existingVisitorId);

    var rating = await db.Ratings.FirstOrDefaultAsync(rating => rating.VisitorId == visitorId);
    var now = DateTime.UtcNow;

    if (rating is null)
    {
        rating = new Rating
        {
            Value = input.Value,
            VisitorId = visitorId,
            FingerprintHash = fingerprintHash,
            CoarseFingerprintHash = coarseFingerprintHash,
            IpHash = ipHash,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
        db.Ratings.Add(rating);
    }
    else
    {
        rating.Value = input.Value;
        rating.FingerprintHash = fingerprintHash;
        rating.CoarseFingerprintHash = coarseFingerprintHash;
        rating.IpHash = ipHash;
        rating.UpdatedAtUtc = now;
    }

    await db.SaveChangesAsync();

    var values = await db.Ratings.Select(rating => rating.Value).ToListAsync();
    var distribution = new int[5];
    foreach (var value in values)
    {
        if (value is >= 1 and <= 5) distribution[value - 1]++;
    }

    return Results.Ok(new RatingOutput(
        rating.Value,
        new RatingSummary(Math.Round(values.Average(), 2), values.Count, distribution)));
}).RequireRateLimiting("post-ratings");

// Last 365 days, oldest first, zero-filled — a GitHub-contributions-style calendar
// reads its own gaps as "no traffic that day", so the frontend never has to backfill.
async Task<List<HeatmapDay>> BuildHeatmapDaysAsync(CommentsDbContext db, DateTime now)
{
    var since = DateOnly.FromDateTime(now.AddDays(-364));
    var counts = await db.HeatmapPoints
        .Where(point => point.Date >= since)
        .GroupBy(point => point.Date)
        .Select(group => new HeatmapDay(group.Key, group.Count()))
        .ToDictionaryAsync(day => day.Date);

    return Enumerable.Range(0, 365)
        .Select(offset => since.AddDays(offset))
        .Select(date => counts.TryGetValue(date, out var day) ? day : new HeatmapDay(date, 0))
        .ToList();
}

var heatmap = app.MapGroup("/heatmap");

heatmap.MapGet("/summary", async (CommentsDbContext db) =>
    Results.Ok(await BuildHeatmapDaysAsync(db, DateTime.UtcNow))
).RequireRateLimiting("read-comments");

// One point per visitor per 6-hour window per day. The unique index does the actual
// enforcement; this just races to insert and reports "already added" on conflict
// rather than pre-checking, since pre-checking can't close the same race anyway.
heatmap.MapPost("/", async (HeatmapInput input, HttpContext http, CommentsDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Fingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = input.CoarseFingerprint is null ? null : VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    var existingVisitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);
    var visitorId = http.GetOrIssueVisitorCookie(existingVisitorId);

    var now = DateTime.UtcNow;
    var today = DateOnly.FromDateTime(now);
    var windowSlot = now.Hour / 6;

    var added = true;
    var alreadyHasSlot = await db.HeatmapPoints.AnyAsync(point =>
        point.VisitorId == visitorId && point.Date == today && point.WindowSlot == windowSlot);

    if (!alreadyHasSlot)
    {
        db.HeatmapPoints.Add(new HeatmapPoint
        {
            VisitorId = visitorId,
            Date = today,
            WindowSlot = windowSlot,
            CreatedAtUtc = now,
        });

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Lost the race against a concurrent request for the same visitor/window.
            added = false;
        }
    }
    else
    {
        added = false;
    }

    var days = await BuildHeatmapDaysAsync(db, now);

    return Results.Ok(new HeatmapOutput(added, days));
}).RequireRateLimiting("post-ratings");

// One request answers who the visitor is for all three features at once, so they can
// never disagree, and it refreshes the cookie so every later request takes the exact
// -match path. Fired from the EXPLORE press, long before the visitor scrolls to Extra.
app.MapPost("/visitor/session", async (VisitorSessionInput input, HttpContext http, CommentsDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(input.Fingerprint) || string.IsNullOrWhiteSpace(input.CoarseFingerprint))
        return Results.BadRequest("Missing fingerprint.");

    var fingerprintHash = VisitorIdentity.Sha256Hex(input.Fingerprint);
    var coarseFingerprintHash = VisitorIdentity.Sha256Hex(input.CoarseFingerprint);
    var ipHash = VisitorIdentity.HashIp(http, ipHashSalt);

    var hadCookie = http.GetExistingVisitorId() is not null;
    var existingVisitorId = await VisitorResolver.ResolveVisitorIdAsync(http, db, fingerprintHash, coarseFingerprintHash, ipHash);
    var visitorId = http.GetOrIssueVisitorCookie(existingVisitorId);

    var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
    var rating = await db.Ratings.FirstOrDefaultAsync(rating => rating.VisitorId == visitorId);
    var isUnlocked = await db.VisitorUnlocks.AnyAsync(unlock => unlock.VisitorId == visitorId);

    // A coarse-only match is a guess, not a recognition: two identically specced
    // machines on one network resolve to each other. The unlock is harmless to hand
    // over, but a name and a message are not — withhold those and show an empty form.
    var isWeakMatch = comment is not null && !hadCookie && comment.FingerprintHash != fingerprintHash;

    return Results.Ok(new VisitorSessionOutput(
        visitorId,
        isWeakMatch ? null : (comment is null ? null : CommentOutput.From(comment)),
        rating?.Value,
        isUnlocked));
}).RequireRateLimiting("unlock");

// Wipes everything the API knows about the caller — comment, rating, unlock and the
// identity cookie — so the next visit is indistinguishable from a first one. Exposed as
// the classified section's "DELETE DATA" button; also the only practical way to re-test
// the single-use QR unlock.
app.MapDelete("/visitor", async (HttpContext http, CommentsDbContext db) =>
{
    var visitorId = http.GetExistingVisitorId();
    if (visitorId is not null)
    {
        var comment = await db.Comments.FirstOrDefaultAsync(comment => comment.VisitorId == visitorId);
        if (comment is not null) db.Comments.Remove(comment);

        var rating = await db.Ratings.FirstOrDefaultAsync(rating => rating.VisitorId == visitorId);
        if (rating is not null) db.Ratings.Remove(rating);

        // Without this the server re-unlocks on the next lookup and the QR flow
        // becomes untestable — the whole reason this endpoint exists.
        var unlock = await db.VisitorUnlocks.FirstOrDefaultAsync(unlock => unlock.VisitorId == visitorId);
        if (unlock is not null) db.VisitorUnlocks.Remove(unlock);

        await db.SaveChangesAsync();
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

admin.MapDelete("/", async (CommentsDbContext db) =>
{
    await db.Comments.ExecuteDeleteAsync();
    return Results.NoContent();
});

app.Run();
