namespace Server.DTOs
{
    public class CreateReviewDto
    {
        public int CourseId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}