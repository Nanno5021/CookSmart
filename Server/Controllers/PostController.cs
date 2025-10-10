using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using Server.DTOs;

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


        [HttpPost]
        [Authorize]
        public IActionResult CreatePost([FromBody] PostDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid data.");

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


        [HttpGet]
        public IActionResult GetAllPosts()
        {
            var posts = _context.Posts.ToList();
            return Ok(posts);
        }
    }
}
