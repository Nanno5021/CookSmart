namespace Server.DTOs
{
    public class CreateQuizQuestionDto
    {
        public string Question { get; set; } = string.Empty;
        public string Option1 { get; set; } = string.Empty;
        public string Option2 { get; set; } = string.Empty;
        public string Option3 { get; set; } = string.Empty;
        public string Option4 { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public int QuestionOrder { get; set; }
    }
}