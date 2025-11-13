// CommentLike.cs
namespace Server.Models
{
    public class CommentLike
    {
        public int id { get; set; }
        public int userId { get; set; }
        public User User { get; set; } = null!;
        public int commentId { get; set; }
        public Comment Comment { get; set; } = null!;
        public DateTime createdAt { get; set; } = DateTime.UtcNow;
    }
}