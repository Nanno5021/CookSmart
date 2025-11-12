namespace Server.DTOs
{
    public class PostDto
    {
        public int id { get; set; }
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int rating { get; set; }
        public int comments { get; set; }
        public int views { get; set; }
        public string username { get; set; } = string.Empty;
        public string avatarUrl { get; set; } = string.Empty;

        // ✅ Add this
        public string? imageUrl { get; set; }

        public bool isLikedByCurrentUser { get; set; }

    }

}