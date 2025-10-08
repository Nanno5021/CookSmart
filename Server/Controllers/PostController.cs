using Microsoft.AspNetCore.Mvc;
using Server.Data; 
using Server.Models; 
using Server.DTOs.Post;   

namespace Server.Controllers
{ 
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ CREATE POST
        [HttpPost("post")]
        public IActionResult CreatePost(PostDto dto)
        {
            var post = new Post
            {
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            _context.SaveChanges();

            return Ok(new { message = "Post created successfully!", postId = post.Id });
        }

        // ✅ GET ALL POSTS
        [HttpGet("all")]
        public IActionResult GetAllPosts()
        {
            var posts = _context.Posts.ToList();
            return Ok(posts);
        }
    }
}