namespace Portfolio.Api.Models;

public class Comment
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Text { get; set; }
    public required string VisitorId { get; set; }
    public required string FingerprintHash { get; set; }
    /// <summary>Null on rows written before the cross-browser lookup existed.</summary>
    public string? CoarseFingerprintHash { get; set; }
    public required string IpHash { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    /// <summary>A visitor gets exactly one edit; the server, not the button state, enforces it.</summary>
    public int EditCount { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public bool IsHidden { get; set; }
}
