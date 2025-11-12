// CommentDto.cs
namespace Server.DTOs
{
    public class CommentDto
    {
        public int id { get; set; }
        public string content { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public int likes { get; set; } = 0;
        public string username { get; set; } = string.Empty;
        public string avatarUrl { get; set; } = string.Empty;
        
        // For nested comments (optional)
        public int? parentCommentId { get; set; }
        public List<CommentDto>? replies { get; set; }

        public bool isLikedByCurrentUser { get; set; }
    }

    public class CreateCommentDto
    {
        public string content { get; set; } = string.Empty;
        public int? parentCommentId { get; set; }
    }
}