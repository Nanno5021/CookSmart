using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/admin/posts")]
    [Authorize(Roles = "Admin")]
    public class AdminPostController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AdminPostController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/admin/posts - Get all blog posts
        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .OrderByDescending(p => p.createdAt)
                .Select(p => new BlogPostDto
                {
                    id = p.id,
                    title = p.title,
                    content = p.content,
                    createdAt = p.createdAt,
                    rating = p.rating,
                    comments = p.comments,
                    views = p.views,
                    imageUrl = p.imageUrl,
                    userId = p.userId,
                    authorName = p.User.fullName,
                    authorUsername = p.User.username
                })
                .ToListAsync();

            return Ok(posts);
        }

        // GET: api/admin/posts/{id} - Get single post by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPostById(int id)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.id == id);

            if (post == null)
                return NotFound(new { message = "Post not found." });

            var postDto = new BlogPostDto
            {
                id = post.id,
                title = post.title,
                content = post.content,
                createdAt = post.createdAt,
                rating = post.rating,
                comments = post.comments,
                views = post.views,
                imageUrl = post.imageUrl,
                userId = post.userId,
                authorName = post.User.fullName,
                authorUsername = post.User.username
            };

            return Ok(postDto);
        }

        // PUT: api/admin/posts/{id} - Update a blog post
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdateBlogPostDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.title))
                return BadRequest(new { message = "Title is required." });

            if (string.IsNullOrWhiteSpace(dto.content))
                return BadRequest(new { message = "Content is required." });

            var post = await _context.Posts.FindAsync(id);
            
            if (post == null)
                return NotFound(new { message = "Post not found." });

            // Update post fields
            post.title = dto.title.Trim();
            post.content = dto.content.Trim();

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Post updated successfully.",
                post = new BlogPostDto
                {
                    id = post.id,
                    title = post.title,
                    content = post.content,
                    createdAt = post.createdAt,
                    rating = post.rating,
                    comments = post.comments,
                    views = post.views,
                    imageUrl = post.imageUrl,
                    userId = post.userId
                }
            });
        }

        // POST: api/admin/posts/{id}/image - Upload blog image
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadBlogImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Only image files are allowed." });

            const long maxBytes = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxBytes)
                return BadRequest(new { message = "File too large. Max 5 MB." });

            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound(new { message = "Post not found." });

            // Ensure uploads folder exists
            var uploadsDir = Path.Combine(
                _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), 
                "post_uploads"
            );
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            // Delete old image if exists
            if (!string.IsNullOrEmpty(post.imageUrl))
            {
                var oldImagePath = Path.Combine(_env.WebRootPath ?? "wwwroot", post.imageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            // Save new image
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var publicUrl = $"{Request.Scheme}://{Request.Host}/post_uploads/{fileName}";
            post.imageUrl = publicUrl;
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = publicUrl });
        }

        // DELETE: api/admin/posts/{id}/image - Remove blog image
        [HttpDelete("{id}/image")]
        public async Task<IActionResult> RemoveBlogImage(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound(new { message = "Post not found." });

            if (string.IsNullOrEmpty(post.imageUrl))
                return BadRequest(new { message = "Post has no image to remove." });

            // Delete physical file
            var imagePath = Path.Combine(_env.WebRootPath ?? "wwwroot", post.imageUrl.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }

            // Remove from database
            post.imageUrl = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image removed successfully." });
        }

        // DELETE: api/admin/posts/{id} - Delete a post
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            
            if (post == null)
                return NotFound(new { message = "Post not found." });

            // Delete associated image if exists
            if (!string.IsNullOrEmpty(post.imageUrl))
            {
                var imagePath = Path.Combine(_env.WebRootPath ?? "wwwroot", post.imageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post deleted successfully." });
        }

        // GET: api/admin/posts/stats - Get blog statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetBlogStats()
        {
            var totalPosts = await _context.Posts.CountAsync();
            var totalViews = await _context.Posts.SumAsync(p => p.views);
            var totalRatings = await _context.Posts.SumAsync(p => p.rating);
            var totalComments = await _context.Posts.SumAsync(p => p.comments);

            return Ok(new
            {
                totalPosts = totalPosts,
                totalViews = totalViews,
                totalRatings = totalRatings,
                totalComments = totalComments,
                averageRating = totalPosts > 0 ? (double)totalRatings / totalPosts : 0
            });
        }
    }
}