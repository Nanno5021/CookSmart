namespace Server.DTOs
{
    public class CourseSectionResponseDto
    {
        public int id { get; set; }
        public string sectionTitle { get; set; } = string.Empty;
        public string contentType { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public int sectionOrder { get; set; }
    }
}