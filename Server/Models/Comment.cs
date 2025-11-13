namespace Server.Models
{
    public class Comment
    {
        public int id { get; set; }
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int likes { get; set; } = 0;

        // Foreign Keys
        public int postId { get; set; }
        public Post Post { get; set; } = null!;

        public int userId { get; set; }
        public User User { get; set; } = null!;

        // For nested replies (optional - can implement later)
        public int? parentCommentId { get; set; }
        public Comment? ParentComment { get; set; }
        public ICollection<Comment> Replies { get; set; } = new List<Comment>();
        // Comment.cs - Add this property
        public ICollection<CommentLike> CommentLikes { get; set; } = new List<CommentLike>();
    }
}