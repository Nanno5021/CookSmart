using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProfileController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET api/profile/me - requires auth
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized(new { message = "Invalid token." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var posts = new List<PostDto>();
            if (_context.Posts != null)
            {
                posts = await _context.Posts
                    .Where(p => p.userId == userId)
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
                        imageUrl = p.imageUrl // ✅ ADD THIS LINE - FIX
                    })
                    .ToListAsync();
            }

            return Ok(new ProfileDto
            {
                id = user.id,
                fullName = user.fullName,
                username = user.username,
                email = user.email,
                phone = user.phone ?? string.Empty,
                bio = string.Empty,
                avatarUrl = user.avatarUrl ?? string.Empty,
                posts = posts
            });
        }

        // PUT api/profile - update profile
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] ProfileDto update)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized(new { message = "Invalid token." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (!string.IsNullOrWhiteSpace(update.fullName))
                user.fullName = update.fullName;
            if (!string.IsNullOrWhiteSpace(update.phone))
                user.phone = update.phone;
            if (!string.IsNullOrWhiteSpace(update.avatarUrl))
                user.avatarUrl = update.avatarUrl;

            await _context.SaveChangesAsync();

            return Ok(new ProfileDto
            {
                id = user.id,
                fullName = user.fullName,
                username = user.username,
                email = user.email,
                phone = user.phone ?? string.Empty,
                bio = string.Empty,
                avatarUrl = user.avatarUrl ?? string.Empty
            });
        }

        // POST api/profile/avatar - upload avatar
        [HttpPost("avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Only image files are allowed." });

            const long maxBytes = 5 * 1024 * 1024;
            if (file.Length > maxBytes)
                return BadRequest(new { message = "File too large. Max 5 MB." });

            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized(new { message = "Invalid token." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            // Ensure uploads folder exists
            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var publicUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            user.avatarUrl = publicUrl;
            await _context.SaveChangesAsync();

            return Ok(new { avatarUrl = publicUrl });
        }

        // GET api/profile/{username} - public profile
        [HttpGet("{username}")]
        public async Task<IActionResult> GetByUsername(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
            if (user == null) return NotFound(new { message = "User not found." });

            return Ok(new ProfileDto
            {
                id = user.id,
                fullName = user.fullName,
                username = user.username,
                email = string.Empty,
                phone = string.Empty,
                bio = string.Empty,
                avatarUrl = user.avatarUrl ?? string.Empty
            });
        }

        // Helper to extract userId from JWT claims
        private int? GetUserIdFromClaims()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "id" || c.Type == "sub")?.Value;
            if (int.TryParse(claim, out var userId))
                return userId;
            return null;
        }
    }
}
