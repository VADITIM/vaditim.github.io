using Microsoft.AspNetCore.SignalR;

namespace Portfolio.Api.Unlock;

/// <summary>
/// Realtime channel the desktop page listens on while it shows the QR code.
/// One SignalR group per session id; the scan endpoint broadcasts <c>unlocked</c> to it.
/// </summary>
public sealed class UnlockHub : Hub
{
    private readonly UnlockSessionStore sessionStore;

    public UnlockHub(UnlockSessionStore sessionStore) => this.sessionStore = sessionStore;

    /// <summary>
    /// Called by the desktop client on connect and on every reconnect. Registering here
    /// rather than via an endpoint means a session only becomes claimable while someone
    /// is actually listening for the push.
    /// </summary>
    public async Task Subscribe(string sessionId)
    {
        if (!UnlockSessionStore.IsWellFormedSessionId(sessionId))
            throw new HubException("Malformed session id.");

        sessionStore.Register(sessionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));
    }

    public static string GroupName(string sessionId) => $"unlock:{sessionId}";
}
