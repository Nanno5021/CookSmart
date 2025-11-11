namespace Server.DTOs
{
    public class CreateCourseDto
    {
        public int chefId { get; set; }
        public string courseName { get; set; } = string.Empty;
        public string courseImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string difficulty { get; set; } = string.Empty;
        public string estimatedTime { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public List<CreateCourseSectionDto> sections { get; set; } = new List<CreateCourseSectionDto>();
        public List<CreateQuizQuestionDto> quizQuestions { get; set; } = new List<CreateQuizQuestionDto>();
    }
}