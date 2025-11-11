namespace Server.DTOs
{
    public class CreateReviewDto
    {
        public int courseId { get; set; }
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
    }
}