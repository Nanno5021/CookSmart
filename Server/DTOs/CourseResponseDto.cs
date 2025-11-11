namespace Server.DTOs
{
    public class CourseResponseDto
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string chefName { get; set; } = string.Empty;
        public string chefImage { get; set; } = string.Empty;
        public string courseName { get; set; } = string.Empty;
        public string courseImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty;
        public string estimatedTime { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public List<CourseSectionResponseDto> sections { get; set; } = new List<CourseSectionResponseDto>();
        public List<QuizQuestionResponseDto> quizQuestions { get; set; } = new List<QuizQuestionResponseDto>();
    }
}