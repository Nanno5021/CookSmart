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
        }
        public DbSet<ChefApplication> ChefApplications { get; set; }
        public DbSet<Chef> Chefs { get; set; }
    }
}