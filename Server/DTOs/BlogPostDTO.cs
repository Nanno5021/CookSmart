using System;
using System.Collections.Generic;

namespace Server.DTOs
{
    public class BlogPostDto
    {
        public int id { get; set; }
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int rating { get; set; }
        public int comments { get; set; }
        public int views { get; set; }
        public string? imageUrl { get; set; }
        
        // Author information
        public int userId { get; set; }
        public string authorName { get; set; } = string.Empty;
        public string authorUsername { get; set; } = string.Empty;
    }

    public class UpdatePostStatusDto
    {
        public string status { get; set; } = string.Empty;
    }
}
