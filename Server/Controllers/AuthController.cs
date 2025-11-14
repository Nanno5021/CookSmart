using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Server.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }


        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            // Check if email already exists
            if (_context.Users.Any(u => u.email == dto.email))
            {
                return BadRequest(new { message = "Email already registered." });
            }

            // Check if username already exists
            if (_context.Users.Any(u => u.username == dto.username))
            {
                return BadRequest(new { message = "Username already taken." });
            }

            // Hash the password before storing
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.password);
            var defaultAvatar = $"{Request.Scheme}://{Request.Host}/uploads/default.png"; // ensure default.png exists in wwwroot/uploads

            var user = new User
            {
                fullName = dto.fullName,
                username = dto.username,
                email = dto.email,
                phone = dto.phone,
                password = hashedPassword,
                role = dto.role ?? "User",
                avatarUrl = defaultAvatar
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully!" });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Identifier) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Invalid login data." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.email == dto.Identifier || u.username == dto.Identifier);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.password))
                return Unauthorized(new { message = "Invalid username/email or password." });

            if (user.isBanned)
                return StatusCode(403, new { message = "Your account has been banned. Please contact support for more information." });

            var token = GenerateJwtToken(user);

            int? chefId = null;
            if (user.role.Equals("Chef", StringComparison.OrdinalIgnoreCase))
            {
                var chef = await _context.Chefs
                    .FirstOrDefaultAsync(c => c.userId == user.id);
                
                if (chef != null)
                {
                    chefId = chef.id;
                }
            }

            return Ok(new
            {
                message = "Login successful",
                token = token,
                user = new
                {
                    user.id,
                    user.username,
                    user.email,
                    user.fullName,
                    user.phone,
                    user.role,
                    user.avatarUrl,
                    chefId = chefId 
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.username),
                new Claim(JwtRegisteredClaimNames.Email, user.email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", user.id.ToString()),
                new Claim("fullName", user.fullName ?? ""),
                new Claim("role", user.role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}