namespace Server.Models
{
    public class CourseReview
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Course? Course { get; set; }
        public User? User { get; set; }
    }
}