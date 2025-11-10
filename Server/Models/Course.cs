namespace Server.Models
{
    public class Course
    {
        public int Id { get; set; }
        public int ChefId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseImage { get; set; } = string.Empty;
        public string Ingredients { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty; // Easy, Medium, Hard
        public string EstimatedTime { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? Chef { get; set; }
        public ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
        public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
        public ICollection<CourseReview> Reviews { get; set; } = new List<CourseReview>();
    }
}