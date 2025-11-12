namespace Server.DTOs
{
    public class UpdateCourseReviewDto
    {
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
    }
}