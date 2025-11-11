using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/posts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts()
        {
            if (_context.Posts == null)
                return NotFound(new { message = "Posts not found" });

            // Join posts with users to include username + avatar
            var posts = await _context.Posts
                .Include(p => p.User)
                .OrderByDescending(p => p.createdAt)
                .Select(p => new PostDto
                {
                    id = p.id,
                    title = p.title,
                    content = p.content,
                    createdAt = p.createdAt,
                    rating = p.rating,
                    comments = p.comments,
                    views = p.views,
                    username = p.User != null
                        ? (!string.IsNullOrWhiteSpace(p.User.username)
                            ? p.User.username
                            : (!string.IsNullOrWhiteSpace(p.User.fullName)
                                ? p.User.fullName
                                : $"user{p.User.id}"))
                        : "Anonymous",
                    avatarUrl = p.User != null && !string.IsNullOrWhiteSpace(p.User.avatarUrl)
                        ? p.User.avatarUrl
                        : string.Empty
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PostDto>> CreatePost([FromBody] PostDto postDto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "id" || c.Type == "sub")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user ID" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
            if (user == null)
                return Unauthorized(new { message = "User not found" });

            var newPost = new Post
            {
                title = postDto.title ?? string.Empty,
                content = postDto.content ?? string.Empty,
                createdAt = DateTime.UtcNow,
                rating = 0,
                comments = 0,
                views = 0,
                userId = userId,
                imageUrl = postDto.imageUrl // ✅ store the uploaded image URL
            };

            _context.Posts.Add(newPost);
            await _context.SaveChangesAsync();

            var createdDto = new PostDto
            {
                id = newPost.id,
                title = newPost.title,
                content = newPost.content,
                createdAt = newPost.createdAt,
                rating = newPost.rating,
                comments = newPost.comments,
                views = newPost.views,
                username = user.username ?? user.fullName ?? $"user{user.id}",
                avatarUrl = user.avatarUrl ?? string.Empty,
                imageUrl = newPost.imageUrl
            };

            return CreatedAtAction(nameof(GetPosts), new { id = newPost.id }, createdDto);
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadPostImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Only image files are allowed." });

            const long maxBytes = 5 * 1024 * 1024;
            if (file.Length > maxBytes)
                return BadRequest(new { message = "File too large. Max 5 MB." });

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "post_uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var publicUrl = $"{Request.Scheme}://{Request.Host}/post_uploads/{fileName}";
            return Ok(new { imageUrl = publicUrl });
}
    }
}
