namespace Server.DTOs
{
    public class QuizQuestionResponseDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new List<string>();
        public string Answer { get; set; } = string.Empty;
        public int QuestionOrder { get; set; }
    }
}