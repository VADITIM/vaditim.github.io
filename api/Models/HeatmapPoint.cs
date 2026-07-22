namespace Portfolio.Api.Models;

/// <summary>
/// One visitor's contribution to one 6-hour window of one calendar day. The unique
/// index on (VisitorId, Date, WindowSlot) is what enforces "one point per 6 hours" —
/// the endpoint just races to insert and treats a conflict as "already added today".
/// </summary>
public class HeatmapPoint
{
    public int Id { get; set; }
    public required string VisitorId { get; set; }
    public DateOnly Date { get; set; }
    /// <summary>0–3, the visitor's UTC hour-of-day divided by 6.</summary>
    public int WindowSlot { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
