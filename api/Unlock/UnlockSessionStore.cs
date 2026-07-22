using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace Portfolio.Api.Unlock;

/// <summary>
/// Tracks which desktop unlock sessions are currently listening, so a scan can only
/// ever reach a session that really exists. Deliberately in-memory: an unlock is a
/// one-shot easter egg, and losing the set on restart just means the desktop page
/// re-subscribes. See <c>UnlockHub</c> for how sessions get registered.
/// </summary>
public sealed class UnlockSessionStore
{
    public static readonly TimeSpan SessionLifetime = TimeSpan.FromMinutes(15);

    /// <summary>
    /// How long the desktop has to redeem its claim token after the phone scans.
    /// Short on purpose — the desktop is already listening, so it answers in
    /// milliseconds; anything longer is just a wider window for a stolen token.
    /// </summary>
    private static readonly TimeSpan ClaimTokenLifetime = TimeSpan.FromMinutes(2);

    // Minted client-side as 32 hex chars; anything else is a probe, not a real session.
    private static readonly Regex SessionIdPattern = new("^[0-9a-f]{32}$", RegexOptions.Compiled);

    private readonly ConcurrentDictionary<string, SessionState> sessions = new();

    // Tokens live apart from sessions: the session is claimed (and may expire) the
    // instant the phone hits it, but the desktop still has to redeem afterwards.
    private readonly ConcurrentDictionary<string, DateTime> claimTokens = new();

    public static bool IsWellFormedSessionId(string sessionId) => SessionIdPattern.IsMatch(sessionId);

    public void Register(string sessionId)
    {
        PruneExpired();
        sessions[sessionId] = new SessionState(DateTime.UtcNow + SessionLifetime, IsUsed: false);
    }

    /// <summary>
    /// Claims the session for a scan and mints the one-time token the desktop redeems
    /// to persist the unlock against its own identity. Returns null when the session
    /// never existed, has expired, or was already claimed — all three are replay protection.
    /// </summary>
    public string? TryClaim(string sessionId)
    {
        PruneExpired();

        if (!sessions.TryGetValue(sessionId, out var state) || state.IsUsed || state.ExpiresAtUtc <= DateTime.UtcNow)
            return null;

        if (!sessions.TryUpdate(sessionId, state with { IsUsed = true }, state))
            return null;

        var claimToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        claimTokens[claimToken] = DateTime.UtcNow + ClaimTokenLifetime;
        return claimToken;
    }

    /// <summary>
    /// Burns the token. Without it <c>POST /unlock/claim</c> would be a free "unlock me"
    /// for anyone who found the route — the token is what authorizes the write, not the cookie.
    /// </summary>
    public bool TryRedeemClaimToken(string claimToken)
    {
        PruneExpired();
        return claimTokens.TryRemove(claimToken, out var expiresAtUtc) && expiresAtUtc > DateTime.UtcNow;
    }

    private void PruneExpired()
    {
        var now = DateTime.UtcNow;
        foreach (var (sessionId, state) in sessions)
        {
            if (state.ExpiresAtUtc <= now)
                sessions.TryRemove(sessionId, out _);
        }
        foreach (var (claimToken, expiresAtUtc) in claimTokens)
        {
            if (expiresAtUtc <= now)
                claimTokens.TryRemove(claimToken, out _);
        }
    }

    private readonly record struct SessionState(DateTime ExpiresAtUtc, bool IsUsed);
}
