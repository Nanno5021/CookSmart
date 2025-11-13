namespace Server.Models
{
    public class Post
    {
        public int id { get; set; }
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int rating { get; set; }
        public int comments { get; set; } // This is the count
        public int views { get; set; }
        public string? imageUrl { get; set; }

        // Foreign key for User
        public int userId { get; set; }
        public User User { get; set; } = null!;

        // ✅ Add this navigation property for Comments
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        // Post.cs - Add this property
        public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();

        // In Post.cs - Add this property
        public ICollection<PostView> PostViews { get; set; } = new List<PostView>();
    }
}