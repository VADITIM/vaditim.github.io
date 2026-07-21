namespace Portfolio.Api;

public record CommentInput(string Name, string Text, string Fingerprint);

public record CommentOutput(int Id, string Name, string Text, DateTime CreatedAtUtc, bool IsFlagged, bool IsHidden)
{
    public static CommentOutput From(Models.Comment comment)
        => new(comment.Id, comment.Name, comment.Text, comment.CreatedAtUtc, comment.IsFlagged, comment.IsHidden);
}

public record ModerationInput(bool? IsHidden);
