// PostView.cs
namespace Server.Models
{
    public class PostView
    {
        public int id { get; set; }
        public int userId { get; set; }
        public User User { get; set; } = null!;
        public int postId { get; set; }
        public Post Post { get; set; } = null!;
        public DateTime viewedAt { get; set; } = DateTime.UtcNow;
    }
}