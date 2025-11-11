namespace Server.Models
{
    public class CourseReview
    {
        public int id { get; set; }
        public int courseId { get; set; }
        public int userId { get; set; }
        public int rating { get; set; } // 1-5
        public string comment { get; set; } = string.Empty;
        public DateTime reviewDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Course? course { get; set; }
        public User? user { get; set; }
    }
}