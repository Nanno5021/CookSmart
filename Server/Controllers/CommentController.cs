// CommentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/posts/{postId}/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/posts/{postId}/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(int postId)
        {
            // Check if post exists
            var postExists = await _context.Posts.AnyAsync(p => p.id == postId);
            if (!postExists)
                return NotFound(new { message = "Post not found" });

            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.postId == postId && c.parentCommentId == null) // Only top-level comments
                .OrderByDescending(c => c.createdAt)
                .Select(c => new CommentDto
                {
                    id = c.id,
                    content = c.content,
                    createdAt = c.createdAt,
                    likes = c.likes,
                    username = c.User != null
                        ? (!string.IsNullOrWhiteSpace(c.User.username)
                            ? c.User.username
                            : (!string.IsNullOrWhiteSpace(c.User.fullName)
                                ? c.User.fullName
                                : $"user{c.User.id}"))
                        : "Anonymous",
                    avatarUrl = c.User != null && !string.IsNullOrWhiteSpace(c.User.avatarUrl)
                        ? c.User.avatarUrl
                        : string.Empty,
                    parentCommentId = c.parentCommentId,
                    replies = _context.Comments
                        .Where(r => r.parentCommentId == c.id)
                        .Include(r => r.User)
                        .OrderBy(r => r.createdAt)
                        .Select(r => new CommentDto
                        {
                            id = r.id,
                            content = r.content,
                            createdAt = r.createdAt,
                            likes = r.likes,
                            username = r.User != null
                                ? (!string.IsNullOrWhiteSpace(r.User.username)
                                    ? r.User.username
                                    : (!string.IsNullOrWhiteSpace(r.User.fullName)
                                        ? r.User.fullName
                                        : $"user{r.User.id}"))
                                : "Anonymous",
                            avatarUrl = r.User != null && !string.IsNullOrWhiteSpace(r.User.avatarUrl)
                                ? r.User.avatarUrl
                                : string.Empty,
                            parentCommentId = r.parentCommentId
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/posts/{postId}/comments
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment(int postId, [FromBody] CreateCommentDto createCommentDto)
        {
            // Validate post exists
            var post = await _context.Posts.FindAsync(postId);
            if (post == null)
                return NotFound(new { message = "Post not found" });

            // Get user from token
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "id" || c.Type == "sub")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized(new { message = "User not found" });

            // Validate parent comment if provided
            if (createCommentDto.parentCommentId.HasValue)
            {
                var parentComment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.id == createCommentDto.parentCommentId && c.postId == postId);
                if (parentComment == null)
                    return BadRequest(new { message = "Parent comment not found" });
            }

            // Create new comment
            var newComment = new Comment
            {
                content = createCommentDto.content?.Trim() ?? string.Empty,
                createdAt = DateTime.UtcNow,
                likes = 0,
                postId = postId,
                userId = userId,
                parentCommentId = createCommentDto.parentCommentId
            };

            _context.Comments.Add(newComment);

            // Update post comment count (only for top-level comments)
            if (!createCommentDto.parentCommentId.HasValue)
            {
                post.comments += 1;
            }

            await _context.SaveChangesAsync();

            // Return the created comment
            var commentDto = new CommentDto
            {
                id = newComment.id,
                content = newComment.content,
                createdAt = newComment.createdAt,
                likes = newComment.likes,
                username = user.username ?? user.fullName ?? $"user{user.id}",
                avatarUrl = user.avatarUrl ?? string.Empty,
                parentCommentId = newComment.parentCommentId
            };

            return Ok(commentDto);
        }

        [HttpPost("{commentId}/like")]
        [Authorize]
        public async Task<ActionResult> LikeComment(int postId, int commentId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "id" || c.Type == "sub")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID" });

            // Find comment
            var comment = await _context.Comments
                .Include(c => c.CommentLikes)
                .FirstOrDefaultAsync(c => c.id == commentId && c.postId == postId);
            
            if (comment == null)
                return NotFound(new { message = "Comment not found" });

            // Check if user already liked this comment
            var existingLike = await _context.CommentLikes
                .FirstOrDefaultAsync(cl => cl.commentId == commentId && cl.userId == userId);

            if (existingLike != null)
            {
                // User already liked - unlike (remove the like)
                _context.CommentLikes.Remove(existingLike);
                comment.likes -= 1;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment unliked", likes = comment.likes, liked = false });
            }
            else
            {
                // User hasn't liked - add like
                var newLike = new CommentLike
                {
                    userId = userId,
                    commentId = commentId
                };
                _context.CommentLikes.Add(newLike);
                comment.likes += 1;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment liked", likes = comment.likes, liked = true });
            }
        }

        // DELETE: api/posts/{postId}/comments/{commentId}
        [HttpDelete("{commentId}")]
        [Authorize]
        public async Task<ActionResult> DeleteComment(int postId, int commentId)
        {
            // Get user from token
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "id" || c.Type == "sub")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID" });

            // Find comment
            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.id == commentId && c.postId == postId);
            
            if (comment == null)
                return NotFound(new { message = "Comment not found" });

            // Check if user owns the comment or is admin
            if (comment.userId != userId)
            {
                // You might want to add admin check here
                return Forbid("You can only delete your own comments");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment deleted" });
        }
    }
}