namespace Server.DTOs
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserProfileImage { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; }
    }
}