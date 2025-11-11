namespace Server.DTOs
{
    public class EnrollmentResponseDto
    {
        public int id { get; set; }
        public int userId { get; set; }
        public int courseId { get; set; }
        public string userName { get; set; }
        public string courseName { get; set; }
        public string chefName { get; set; }
        public DateTime enrolledAt { get; set; }
        public double progress { get; set; }
        public bool completed { get; set; }
        public DateTime? completedAt { get; set; }
    }
}