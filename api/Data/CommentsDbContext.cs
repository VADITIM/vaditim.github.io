using Microsoft.EntityFrameworkCore;

using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class CommentsDbContext(DbContextOptions<CommentsDbContext> options) : DbContext(options)
{
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<VisitorUnlock> VisitorUnlocks => Set<VisitorUnlock>();
    public DbSet<HeatmapPoint> HeatmapPoints => Set<HeatmapPoint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(comment => comment.Name).HasMaxLength(40);
            entity.Property(comment => comment.Text).HasMaxLength(280);
            entity.Property(comment => comment.VisitorId).HasMaxLength(64);
            entity.Property(comment => comment.FingerprintHash).HasMaxLength(64);
            entity.Property(comment => comment.CoarseFingerprintHash).HasMaxLength(64);
            entity.Property(comment => comment.IpHash).HasMaxLength(64);
            entity.HasIndex(comment => comment.VisitorId).IsUnique();
            entity.HasIndex(comment => comment.FingerprintHash);
            entity.HasIndex(comment => comment.CoarseFingerprintHash);
            entity.HasIndex(comment => comment.IpHash);
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.Property(rating => rating.VisitorId).HasMaxLength(64);
            entity.Property(rating => rating.FingerprintHash).HasMaxLength(64);
            entity.Property(rating => rating.CoarseFingerprintHash).HasMaxLength(64);
            entity.Property(rating => rating.IpHash).HasMaxLength(64);
            entity.HasIndex(rating => rating.VisitorId).IsUnique();
            entity.HasIndex(rating => rating.FingerprintHash);
            entity.HasIndex(rating => rating.CoarseFingerprintHash);
            entity.HasIndex(rating => rating.IpHash);
        });

        modelBuilder.Entity<VisitorUnlock>(entity =>
        {
            entity.Property(unlock => unlock.VisitorId).HasMaxLength(64);
            entity.Property(unlock => unlock.FingerprintHash).HasMaxLength(64);
            entity.Property(unlock => unlock.CoarseFingerprintHash).HasMaxLength(64);
            entity.Property(unlock => unlock.IpHash).HasMaxLength(64);
            entity.HasIndex(unlock => unlock.VisitorId).IsUnique();
            entity.HasIndex(unlock => unlock.FingerprintHash);
            entity.HasIndex(unlock => unlock.CoarseFingerprintHash);
            entity.HasIndex(unlock => unlock.IpHash);
        });

        modelBuilder.Entity<HeatmapPoint>(entity =>
        {
            entity.Property(point => point.VisitorId).HasMaxLength(64);
            entity.HasIndex(point => new { point.VisitorId, point.Date, point.WindowSlot }).IsUnique();
            entity.HasIndex(point => point.Date);
        });
    }
}
