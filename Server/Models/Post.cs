namespace Server.Models
{
    public class Post
    {
        public int id { get; set; }
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int rating { get; set; }
        public int comments { get; set; }
        public int views { get; set; }

        // ✅ New field for image
        public string? imageUrl { get; set; }

        public int userId { get; set; }
        public User User { get; set; } = null!;
    }
}