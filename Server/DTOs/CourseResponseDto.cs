namespace Server.DTOs
{
    public class CourseResponseDto
    {
        public int Id { get; set; }
        public int ChefId { get; set; }
        public string ChefName { get; set; } = string.Empty;
        public string ChefImage { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CourseImage { get; set; } = string.Empty;
        public string Ingredients { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<CourseSectionResponseDto> Sections { get; set; } = new List<CourseSectionResponseDto>();
        public List<QuizQuestionResponseDto> QuizQuestions { get; set; } = new List<QuizQuestionResponseDto>();
    }
}