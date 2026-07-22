namespace Portfolio.Api;

public record CommentInput(string Name, string Text, string Fingerprint, string? CoarseFingerprint = null);

public record CommentOutput(int Id, string Name, string Text, DateTime CreatedAtUtc, bool CanEdit, bool IsFlagged, bool IsHidden)
{
    public static CommentOutput From(Models.Comment comment)
        => new(comment.Id, comment.Name, comment.Text, comment.CreatedAtUtc, comment.EditCount == 0, comment.IsFlagged, comment.IsHidden);
}

public record ModerationInput(bool? IsHidden);

public record RatingInput(int Value, string Fingerprint, string? CoarseFingerprint = null);

/// <summary>Votes per star, index 0 being one star — for a future breakdown bar.</summary>
public record RatingSummary(double Average, int Count, int[] Distribution);

public record RatingOutput(int Value, RatingSummary Summary);

public record UnlockClaimInput(string ClaimToken, string Fingerprint, string CoarseFingerprint);

public record VisitorSessionInput(string Fingerprint, string CoarseFingerprint);

/// <summary>
/// One answer for the guestbook, the rating and the classified unlock, so the three
/// can never disagree about who is asking.
/// </summary>
public record VisitorSessionOutput(string VisitorId, CommentOutput? Comment, int? Rating, bool IsUnlocked);

public record HeatmapInput(string Fingerprint, string? CoarseFingerprint = null);

/// <summary>One calendar day's point count, for a GitHub-contributions-style calendar.</summary>
public record HeatmapDay(DateOnly Date, int Count);

public record HeatmapOutput(bool Added, IReadOnlyList<HeatmapDay> Days);
