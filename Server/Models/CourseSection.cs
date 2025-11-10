namespace Server.Models
{
    public class CourseSection
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string SectionTitle { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty; // text, image, video
        public string Content { get; set; } = string.Empty;
        public int SectionOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Course? Course { get; set; }
    }
}