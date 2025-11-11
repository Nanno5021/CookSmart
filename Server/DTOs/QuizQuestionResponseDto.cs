namespace Server.DTOs
{
    public class QuizQuestionResponseDto
    {
        public int id { get; set; }
        public string question { get; set; } = string.Empty;
        public List<string> options { get; set; } = new List<string>();
        public string answer { get; set; } = string.Empty;
        public int questionOrder { get; set; }
    }
}