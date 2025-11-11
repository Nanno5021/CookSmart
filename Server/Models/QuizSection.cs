namespace Server.Models
{
    public class QuizQuestion
    {
        public int id { get; set; }
        public int courseId { get; set; }
        public string question { get; set; } = string.Empty;
        public string option1 { get; set; } = string.Empty;
        public string option2 { get; set; } = string.Empty;
        public string option3 { get; set; } = string.Empty;
        public string option4 { get; set; } = string.Empty;
        public string correctAnswer { get; set; } = string.Empty;
        public int questionOrder { get; set; }
        public DateTime createdAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Course? course { get; set; }
    }
}