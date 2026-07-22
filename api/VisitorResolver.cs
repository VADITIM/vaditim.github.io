using Microsoft.EntityFrameworkCore;

using Portfolio.Api.Data;

namespace Portfolio.Api;

/// <summary>
/// The single place that decides who a visitor is. Three layers, tried in order:
/// the identity cookie (exact, same browser), the strict fingerprint hash (same
/// browser after a data wipe), then the coarse fingerprint hash <em>together with</em>
/// the IP hash (the cross-browser case).
///
/// The coarse hash is deliberately weak — two identically specced machines on one
/// network produce the same value — so it never matches on its own. Even paired with
/// the IP it is best effort: a new DHCP lease silently drops the visitor back to a
/// rescan, which costs them nothing.
/// </summary>
public static class VisitorResolver
{
    public readonly record struct FingerprintPair(string Fingerprint, string CoarseFingerprint);

    /// <summary>
    /// Resolves the caller to an existing visitor id, or null if none of the three
    /// layers recognises them. Never issues a cookie — callers decide whether this
    /// request is one that should mint an identity.
    /// </summary>
    public static async Task<string?> ResolveVisitorIdAsync(
        HttpContext http, CommentsDbContext db, string fingerprintHash, string? coarseFingerprintHash, string ipHash)
    {
        var cookieVisitorId = http.GetExistingVisitorId();
        if (cookieVisitorId is not null) return cookieVisitorId;

        var byFingerprint =
            await db.VisitorUnlocks.Where(unlock => unlock.FingerprintHash == fingerprintHash).Select(unlock => unlock.VisitorId).FirstOrDefaultAsync()
            ?? await db.Comments.Where(comment => comment.FingerprintHash == fingerprintHash).Select(comment => comment.VisitorId).FirstOrDefaultAsync()
            ?? await db.Ratings.Where(rating => rating.FingerprintHash == fingerprintHash).Select(rating => rating.VisitorId).FirstOrDefaultAsync();
        if (byFingerprint is not null) return byFingerprint;

        if (string.IsNullOrEmpty(coarseFingerprintHash)) return null;

        return await db.VisitorUnlocks
                   .Where(unlock => unlock.CoarseFingerprintHash == coarseFingerprintHash && unlock.IpHash == ipHash)
                   .Select(unlock => unlock.VisitorId).FirstOrDefaultAsync()
               ?? await db.Comments
                   .Where(comment => comment.CoarseFingerprintHash == coarseFingerprintHash && comment.IpHash == ipHash)
                   .Select(comment => comment.VisitorId).FirstOrDefaultAsync()
               ?? await db.Ratings
                   .Where(rating => rating.CoarseFingerprintHash == coarseFingerprintHash && rating.IpHash == ipHash)
                   .Select(rating => rating.VisitorId).FirstOrDefaultAsync();
    }

    /// <summary>
    /// True when the visitor was recognised only through the coarse layer. Callers that
    /// would show personal data back (a name, a message) must treat that as "not sure
    /// enough" and show an empty form rather than risk printing someone else's words.
    /// </summary>
    public static bool IsWeakMatch(HttpContext http, string resolvedFingerprintHash, string rowFingerprintHash)
        => http.GetExistingVisitorId() is null && resolvedFingerprintHash != rowFingerprintHash;
}
