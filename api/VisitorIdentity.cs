using System.Security.Cryptography;
using System.Text;

namespace Portfolio.Api;

public static class VisitorIdentity
{
    public const string CookieName = "visitorId";

    public static string GetOrIssueVisitorCookie(this HttpContext http)
    {
        if (http.Request.Cookies.TryGetValue(CookieName, out var existing) && IsValidVisitorId(existing))
            return existing;

        var visitorId = Guid.NewGuid().ToString("N");
        http.Response.Cookies.Append(CookieName, visitorId, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            // NOTE: cross-site cookie — gh-pages frontend talks to a different API domain.
            SameSite = SameSiteMode.None,
            MaxAge = TimeSpan.FromDays(365 * 2),
        });
        return visitorId;
    }

    /// <summary>
    /// Deletes the identity cookie. The options must mirror <see cref="GetOrIssueVisitorCookie"/>
    /// exactly or the browser treats it as a different cookie and keeps the original.
    /// </summary>
    public static void ExpireVisitorCookie(this HttpContext http)
        => http.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
        });

    public static string? GetExistingVisitorId(this HttpContext http)
        => http.Request.Cookies.TryGetValue(CookieName, out var value) && IsValidVisitorId(value) ? value : null;

    public static string Sha256Hex(string input)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input))).ToLowerInvariant();

    public static string HashIp(HttpContext http, string salt)
    {
        var ip = http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return Sha256Hex(ip + salt);
    }

    private static bool IsValidVisitorId(string value)
        => value.Length == 32 && value.All(char.IsAsciiLetterOrDigit);
}
