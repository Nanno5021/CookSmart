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
        
        public int userId { get; set; }
        public string authorName { get; set; } = string.Empty;
        public string authorUsername { get; set; } = string.Empty;
        
        // ✅ NEW: Include actual comments
        public List<AdminCommentDto>? commentsList { get; set; }
    }

    public class AdminCommentDto
    {
        public int id { get; set; }
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int likes { get; set; }
        public int userId { get; set; }
        public string userName { get; set; } = string.Empty;
        public string userAvatarUrl { get; set; } = string.Empty;
    }
}