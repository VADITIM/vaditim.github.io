namespace Portfolio.Api.Models;

/// <summary>
/// A visitor who has scanned the QR. Written by the desktop against its own identity —
/// never by the phone that scanned — so the unlock follows the machine that earned it.
/// <c>CoarseFingerprintHash</c> is the deliberately weak cross-browser signal; it must
/// never be matched on its own, only alongside <c>IpHash</c>.
/// </summary>
public class VisitorUnlock
{
    public int Id { get; set; }
    public required string VisitorId { get; set; }
    public required string FingerprintHash { get; set; }
    public required string CoarseFingerprintHash { get; set; }
    public required string IpHash { get; set; }
    public DateTime UnlockedAtUtc { get; set; }
}
