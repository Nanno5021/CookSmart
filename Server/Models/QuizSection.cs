namespace Server.Models
{
    public class QuizQuestion
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Option1 { get; set; } = string.Empty;
        public string Option2 { get; set; } = string.Empty;
        public string Option3 { get; set; } = string.Empty;
        public string Option4 { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public int QuestionOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Course? Course { get; set; }
    }
}