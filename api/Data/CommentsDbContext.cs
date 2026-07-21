using Microsoft.EntityFrameworkCore;

using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class CommentsDbContext(DbContextOptions<CommentsDbContext> options) : DbContext(options)
{
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(comment => comment.Name).HasMaxLength(40);
            entity.Property(comment => comment.Text).HasMaxLength(280);
            entity.Property(comment => comment.VisitorId).HasMaxLength(64);
            entity.Property(comment => comment.FingerprintHash).HasMaxLength(64);
            entity.Property(comment => comment.IpHash).HasMaxLength(64);
            entity.HasIndex(comment => comment.VisitorId).IsUnique();
            entity.HasIndex(comment => comment.FingerprintHash);
            entity.HasIndex(comment => comment.IpHash);
        });
    }
}
