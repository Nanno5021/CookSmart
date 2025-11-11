namespace Server.DTOs
{
    public class CreateQuizQuestionDto
    {
        public string question { get; set; } = string.Empty;
        public string option1 { get; set; } = string.Empty;
        public string option2 { get; set; } = string.Empty;
        public string option3 { get; set; } = string.Empty;
        public string option4 { get; set; } = string.Empty;
        public string correctAnswer { get; set; } = string.Empty;
        public int questionOrder { get; set; }
    }
}