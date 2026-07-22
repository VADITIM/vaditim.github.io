namespace Portfolio.Api.Models;

/// <summary>
/// One star rating per visitor. Unlike a <see cref="Comment"/> this is an upsert —
/// changing your mind is legitimate — so <c>UpdatedAtUtc</c> moves while the row stays.
/// </summary>
public class Rating
{
    public int Id { get; set; }
    public int Value { get; set; }
    public required string VisitorId { get; set; }
    public required string FingerprintHash { get; set; }
    public string? CoarseFingerprintHash { get; set; }
    public required string IpHash { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
