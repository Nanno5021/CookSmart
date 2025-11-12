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
        // In your AppDbContext.cs
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PostLike> PostLikes { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<CourseReview> CourseReviews { get; set; }
        
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeReview> RecipeReviews { get; set; }

        public DbSet<PostView> PostViews { get; set; }
        public DbSet<RecipeReview> RecipeReviews { get; set; }  
        public DbSet<ChefApplication> ChefApplications { get; set; }
        public DbSet<Chef> Chefs { get; set; }
        
        // Add this line for Enrollments
        public DbSet<Enrollment> Enrollments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Course belongs to a Chef (User)
            modelBuilder.Entity<Course>()
                .HasOne(c => c.chef)
                .WithMany()
                .HasForeignKey(c => c.chefId)
                .OnDelete(DeleteBehavior.Cascade);

            // CourseSection belongs to Course
            modelBuilder.Entity<CourseSection>()
                .HasOne(cs => cs.course)
                .WithMany(c => c.sections)
                .HasForeignKey(cs => cs.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            // QuizQuestion belongs to Course
            modelBuilder.Entity<QuizQuestion>()
                .HasOne(q => q.course)
                .WithMany(c => c.quizQuestions)
                .HasForeignKey(q => q.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            // CourseReview belongs to Course and User
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

            // Prevent duplicate reviews (one user can only review a course once)
            modelBuilder.Entity<CourseReview>()
                .HasIndex(r => new { r.courseId, r.userId })
                .IsUnique();

            modelBuilder.Entity<Recipe>()
                .HasOne(r => r.chef)
                .WithMany()
                .HasForeignKey(r => r.chefId)
                .OnDelete(DeleteBehavior.Cascade);

            // RecipeReview belongs to Recipe and User
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

            // Prevent duplicate reviews (one user can only review a recipe once)
            modelBuilder.Entity<RecipeReview>()
                .HasIndex(r => new { r.recipeId, r.userId })
                .IsUnique();

            // Post-Comment relationship
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.postId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Comment relationship
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.userId)
                .OnDelete(DeleteBehavior.Cascade);

            // Self-referencing Comment (for replies)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.parentCommentId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete for replies

                            // PostLike relationships
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

            // Prevent duplicate post likes
            modelBuilder.Entity<PostLike>()
                .HasIndex(pl => new { pl.userId, pl.postId })
                .IsUnique();

            // CommentLike relationships
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

            // Prevent duplicate comment likes
            modelBuilder.Entity<CommentLike>()
                .HasIndex(cl => new { cl.userId, cl.commentId })
                .IsUnique();

                // PostView relationships
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

            // Prevent duplicate views from same user
            modelBuilder.Entity<PostView>()
                .HasIndex(pv => new { pv.userId, pv.postId })
                .IsUnique();

        }
        public DbSet<ChefApplication> ChefApplications { get; set; }
        public DbSet<Chef> Chefs { get; set; }
            // --- ADD THESE CONFIGURATIONS FOR ENROLLMENTS ---

            // Enrollment belongs to User
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.userId)
                .OnDelete(DeleteBehavior.Cascade);

            // Enrollment belongs to Course
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany()
                .HasForeignKey(e => e.courseId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prevent duplicate enrollments (one user can only enroll in a course once)
            modelBuilder.Entity<Enrollment>()
                .HasIndex(e => new { e.userId, e.courseId })
                .IsUnique();

            // Configure decimal precision for progress
            modelBuilder.Entity<Enrollment>()
                .Property(e => e.progress)
                .HasPrecision(3, 2); // 3 total digits, 2 decimal places (0.00 to 1.00)

        }
    }
}