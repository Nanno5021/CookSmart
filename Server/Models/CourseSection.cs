namespace Server.Models
{
    public class CourseSection
    {
        public int id { get; set; }
        public int courseId { get; set; }
        public string sectionTitle { get; set; } = string.Empty;
        public string contentType { get; set; } = string.Empty; // text, image, video
        public string content { get; set; } = string.Empty;
        public int sectionOrder { get; set; }
        public DateTime createdAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Course? course { get; set; }
    }
}