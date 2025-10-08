using Microsoft.AspNetCore.Mvc;
using Server.Data; 
using Server.Models; 
using Server.DTOs;   

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ REGISTER
        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
            {
                return BadRequest("Email already registered.");
            }

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Password = dto.Password 
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully!" });
        }

        // ✅ LOGIN
        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);

            if (user == null || user.Password != dto.Password)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Right now: just return success + user info
            // Later: we’ll return a JWT token
            return Ok(new
            {
                message = "Login successful",
                user = new { user.Id, user.Username, user.Email }
            });
        }
    }
}
