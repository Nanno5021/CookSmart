using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PostLike> PostLikes { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<PostView> PostViews { get; set; }

        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<CourseReview> CourseReviews { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }

        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeReview> RecipeReviews { get; set; }

        public DbSet<ChefApplication> ChefApplications { get; set; }
        public DbSet<Chef> Chefs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // === Course relationships ===
            modelBuilder.Entity<Course>()
                .HasOne(c => c.chef)
                .WithMany()
                .HasForeignKey(c => c.chefId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseSection>()
                .HasOne(cs => cs.course)
                .WithMany(c => c.sections)
                .HasForeignKey(cs => cs.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuizQuestion>()
                .HasOne(q => q.course)
                .WithMany(c => c.quizQuestions)
                .HasForeignKey(q => q.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseReview>()
                .HasOne(r => r.course)
                .WithMany(c => c.reviews)
                .HasForeignKey(r => r.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseReview>()
                .HasOne(r => r.user)
                .WithMany()
                .HasForeignKey(r => r.userId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CourseReview>()
                .HasIndex(r => new { r.courseId, r.userId })
                .IsUnique();

            // === Recipe relationships ===
            modelBuilder.Entity<Recipe>()
                .HasOne(r => r.chef)
                .WithMany()
                .HasForeignKey(r => r.chefId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RecipeReview>()
                .HasOne(r => r.recipe)
                .WithMany(rec => rec.reviews)
                .HasForeignKey(r => r.recipeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RecipeReview>()
                .HasOne(r => r.user)
                .WithMany()
                .HasForeignKey(r => r.userId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RecipeReview>()
                .HasIndex(r => new { r.recipeId, r.userId })
                .IsUnique();

            // === Post relationships ===
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.postId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.parentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostLike>()
                .HasOne(pl => pl.Post)
                .WithMany(p => p.PostLikes)
                .HasForeignKey(pl => pl.postId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostLike>()
                .HasOne(pl => pl.User)
                .WithMany()
                .HasForeignKey(pl => pl.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostLike>()
                .HasIndex(pl => new { pl.userId, pl.postId })
                .IsUnique();

            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.Comment)
                .WithMany(c => c.CommentLikes)
                .HasForeignKey(cl => cl.commentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.User)
                .WithMany()
                .HasForeignKey(cl => cl.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommentLike>()
                .HasIndex(cl => new { cl.userId, cl.commentId })
                .IsUnique();

            modelBuilder.Entity<PostView>()
                .HasOne(pv => pv.Post)
                .WithMany(p => p.PostViews)
                .HasForeignKey(pv => pv.postId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostView>()
                .HasOne(pv => pv.User)
                .WithMany()
                .HasForeignKey(pv => pv.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostView>()
                .HasIndex(pv => new { pv.userId, pv.postId })
                .IsUnique();

            // === Enrollment relationships ===
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany()
                .HasForeignKey(e => e.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enrollment>()
                .HasIndex(e => new { e.userId, e.courseId })
                .IsUnique();

            modelBuilder.Entity<Enrollment>()
                .Property(e => e.progress)
                .HasPrecision(3, 2);

            // Post relationships
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.postId)
                .OnDelete(DeleteBehavior.Cascade); // This ensures comments are deleted when post is deleted

            modelBuilder.Entity<Post>()
                .HasMany(p => p.PostLikes)
                .WithOne(pl => pl.Post)
                .HasForeignKey(pl => pl.postId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Post>()
                .HasMany(p => p.PostViews)
                .WithOne(pv => pv.Post)
                .HasForeignKey(pv => pv.postId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment relationships
            modelBuilder.Entity<Comment>()
                .HasMany(c => c.Replies)
                .WithOne(r => r.ParentComment)
                .HasForeignKey(r => r.parentCommentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasMany(c => c.CommentLikes)
                .WithOne(cl => cl.Comment)
                .HasForeignKey(cl => cl.commentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
