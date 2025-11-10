namespace Server.DTOs
{
    public class CourseSectionResponseDto
    {
        public int Id { get; set; }
        public string SectionTitle { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int SectionOrder { get; set; }
    }
}