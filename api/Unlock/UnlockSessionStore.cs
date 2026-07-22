using System.Collections.Concurrent;
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

    // Minted client-side as 32 hex chars; anything else is a probe, not a real session.
    private static readonly Regex SessionIdPattern = new("^[0-9a-f]{32}$", RegexOptions.Compiled);

    private readonly ConcurrentDictionary<string, SessionState> sessions = new();

    public static bool IsWellFormedSessionId(string sessionId) => SessionIdPattern.IsMatch(sessionId);

    public void Register(string sessionId)
    {
        PruneExpired();
        sessions[sessionId] = new SessionState(DateTime.UtcNow + SessionLifetime, IsUsed: false);
    }

    /// <summary>
    /// Claims the session for a scan. Returns false when it never existed, has expired,
    /// or was already claimed — all three are single-use/replay protection.
    /// </summary>
    public bool TryClaim(string sessionId)
    {
        PruneExpired();

        if (!sessions.TryGetValue(sessionId, out var state) || state.IsUsed || state.ExpiresAtUtc <= DateTime.UtcNow)
            return false;

        return sessions.TryUpdate(sessionId, state with { IsUsed = true }, state);
    }

    private void PruneExpired()
    {
        var now = DateTime.UtcNow;
        foreach (var (sessionId, state) in sessions)
        {
            if (state.ExpiresAtUtc <= now)
                sessions.TryRemove(sessionId, out _);
        }
    }

    private readonly record struct SessionState(DateTime ExpiresAtUtc, bool IsUsed);
}
