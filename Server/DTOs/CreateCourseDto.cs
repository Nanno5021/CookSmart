namespace Server.DTOs
{
    public class CreateCourseDto
    {
        public string CourseName { get; set; } = string.Empty;
        public string CourseImage { get; set; } = string.Empty;
        public string Ingredients { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<CreateCourseSectionDto> Sections { get; set; } = new List<CreateCourseSectionDto>();
        public List<CreateQuizQuestionDto> QuizQuestions { get; set; } = new List<CreateQuizQuestionDto>();
    }
}