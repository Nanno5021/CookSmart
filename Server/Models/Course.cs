namespace Server.Models
{
    public class Course
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string courseName { get; set; } = string.Empty;
        public string courseImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty; // Easy, Medium, Hard
        public string estimatedTime { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public DateTime createdAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? chef { get; set; }
        public ICollection<CourseSection> sections { get; set; } = new List<CourseSection>();
        public ICollection<QuizQuestion> quizQuestions { get; set; } = new List<QuizQuestion>();
        public ICollection<CourseReview> reviews { get; set; } = new List<CourseReview>();
    }
}