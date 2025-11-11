using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using Server.DTOs;
using System.Linq;
using System;

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

        // Create a new post
        [HttpPost]
        [Authorize]
        public IActionResult CreatePost([FromBody] PostDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid data.");

            // get userId and username from JWT claims
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == "userId" || c.Type == "id" || c.Type == "sub"
            )?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var username = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "unknown";

            var post = new Post
            {
                userId = userId,
                username = username,
                title = dto.title,
                content = dto.content,
                createdAt = DateTime.UtcNow,
                rating = 0,
                comments = 0,
                views = 0
            };

            _context.Posts.Add(post);
            _context.SaveChanges();

            return Ok(new { message = "Post created successfully!", postId = post.id });
        }

        // Get all posts (public)
        [HttpGet]
        public IActionResult GetAllPosts()
        {
            var posts = _context.Posts
                .OrderByDescending(p => p.createdAt)
                .ToList();

            return Ok(posts);
        }
    }
}
