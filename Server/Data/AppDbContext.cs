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

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<CourseReview> CourseReviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Course belongs to a Chef (User)
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Chef)
                .WithMany()
                .HasForeignKey(c => c.ChefId)
                .OnDelete(DeleteBehavior.Cascade);

            // CourseSection belongs to Course
            modelBuilder.Entity<CourseSection>()
                .HasOne(cs => cs.Course)
                .WithMany(c => c.Sections)
                .HasForeignKey(cs => cs.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            // QuizQuestion belongs to Course
            modelBuilder.Entity<QuizQuestion>()
                .HasOne(q => q.Course)
                .WithMany(c => c.QuizQuestions)
                .HasForeignKey(q => q.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            // CourseReview belongs to Course and User
            modelBuilder.Entity<CourseReview>()
                .HasOne(r => r.Course)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseReview>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Prevent duplicate reviews (one user can only review a course once)
            modelBuilder.Entity<CourseReview>()
                .HasIndex(r => new { r.CourseId, r.UserId })
                .IsUnique();
        }
    }
}