namespace Server.DTOs
{
    public class CourseReviewResponseDto
    {
        public int id { get; set; }
        public int courseId { get; set; }
        public int userId { get; set; }
        public string username { get; set; } = string.Empty;
        public string userProfileImage { get; set; } = string.Empty;
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
        public DateTime reviewDate { get; set; }
    }
}