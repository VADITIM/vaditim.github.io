namespace Portfolio.Api.Models;

public class Comment
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Text { get; set; }
    public required string VisitorId { get; set; }
    public required string FingerprintHash { get; set; }
    public required string IpHash { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public bool IsHidden { get; set; }
}
