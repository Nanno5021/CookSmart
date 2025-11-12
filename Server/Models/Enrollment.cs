namespace Server.Models
{
    public class Enrollment
    {
        public int id { get; set; }
        public int userId { get; set; }
        public int courseId { get; set; }
        public DateTime enrolledAt { get; set; } = DateTime.UtcNow;
        public double progress { get; set; } = 0.0; // 0.0 to 1.0
        public bool completed { get; set; } = false;
        public DateTime? completedAt { get; set; }

        // Navigation properties
        public User User { get; set; }
        public Course Course { get; set; }
    }
}