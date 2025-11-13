using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTO;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManageUserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ManageUserController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/ManageUser
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDTO
                {
                    id = u.id,
                    fullName = u.fullName,
                    username = u.username,
                    email = u.email,
                    phone = u.phone,
                    role = u.role,
                    isBanned = u.isBanned,
                    joinDate = u.joinDate
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/ManageUser/users/{id}
        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserDetailDTO>> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.id == id)
                .Select(u => new UserDetailDTO
                {
                    id = u.id,
                    fullName = u.fullName,
                    username = u.username,
                    email = u.email,
                    phone = u.phone,
                    role = u.role,
                    isBanned = u.isBanned,
                    joinDate = u.joinDate,
                    avatarUrl = u.avatarUrl,
                    // Load chef profile if user is a chef
                    chefProfile = u.role == "Chef" ? _context.Chefs
                        .Where(c => c.userId == u.id)
                        .Select(c => new ChefDTO
                        {
                            id = c.id,
                            specialtyCuisine = c.specialtyCuisine,
                            yearsOfExperience = c.yearsOfExperience,
                            certificationName = c.certificationName,
                            certificationImageUrl = c.certificationImageUrl,
                            portfolioLink = c.portfolioLink,
                            biography = c.biography,
                            rating = c.rating,
                            totalReviews = c.totalReviews,
                            approvedDate = c.approvedDate
                        })
                        .FirstOrDefault() : null
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        // PUT: api/ManageUser/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDTO dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) 
                return NotFound(new { message = "User not found" });

            // Update fields
            if (!string.IsNullOrWhiteSpace(dto.fullName))
                user.fullName = dto.fullName;
            
            if (!string.IsNullOrWhiteSpace(dto.username))
            {
                // Check if username is already taken by another user
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.username == dto.username && u.id != id);
                if (existingUser != null)
                    return BadRequest(new { message = "Username already taken" });
                
                user.username = dto.username;
            }

            if (!string.IsNullOrWhiteSpace(dto.email))
            {
                // Check if email is already taken by another user
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.email == dto.email && u.id != id);
                if (existingUser != null)
                    return BadRequest(new { message = "Email already in use" });
                
                user.email = dto.email;
            }

            if (dto.phone != null)
                user.phone = dto.phone;

            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully" });
        }

        // POST: api/ManageUser/upload-avatar/{id}
        [HttpPost("upload-avatar/{id}")]
        public async Task<IActionResult> UploadAvatar(int id, [FromForm] IFormFile file)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only images are allowed." });

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 5MB limit" });

            try
            {
                // Delete old avatar if it's not the default
                if (!string.IsNullOrEmpty(user.avatarUrl) && 
                    !user.avatarUrl.Contains("default.png"))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, user.avatarUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                // Generate unique filename
                var fileName = $"user_{id}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update user avatar URL
                user.avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = "Avatar uploaded successfully",
                    avatarUrl = user.avatarUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading file", error = ex.Message });
            }
        }

        // POST: api/ManageUser/reset-avatar/{id}
        [HttpPost("reset-avatar/{id}")]
        public async Task<IActionResult> ResetAvatar(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Delete current avatar if it's not the default
            if (!string.IsNullOrEmpty(user.avatarUrl) && 
                !user.avatarUrl.Contains("default.png"))
            {
                var oldFilePath = Path.Combine(_env.WebRootPath, user.avatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue
                        Console.WriteLine($"Error deleting file: {ex.Message}");
                    }
                }
            }

            // Set to default avatar
            user.avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/default.png";
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Avatar reset to default",
                avatarUrl = user.avatarUrl
            });
        }

        // POST: api/ManageUser/update-role/{id}
        [HttpPost("update-role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] string newRole)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.role = newRole;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User role updated." });
        }

        // POST: api/ManageUser/ban/{id}
        [HttpPost("ban/{id}")]
        public async Task<IActionResult> BanUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.isBanned = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User banned." });
        }

        // POST: api/ManageUser/create-chef/{id}
        [HttpPost("create-chef/{id}")]
        public async Task<IActionResult> CreateChefProfile(int id, [FromBody] CreateChefDTO dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Check if user is already a chef
            var existingChef = await _context.Chefs.FirstOrDefaultAsync(c => c.userId == id);
            if (existingChef != null)
                return BadRequest(new { message = "User already has a chef profile" });

            // Create new chef entry
            var chef = new Chef
            {
                userId = id,
                specialtyCuisine = dto.specialtyCuisine,
                yearsOfExperience = dto.yearsOfExperience,
                certificationName = dto.certificationName,
                certificationImageUrl = dto.certificationImageUrl,
                portfolioLink = dto.portfolioLink,
                biography = dto.biography,
                approvedDate = DateTime.Now
            };

            _context.Chefs.Add(chef);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Chef profile created successfully" });
        }

        [HttpDelete("delete-chef/{id}")]
        public async Task<IActionResult> DeleteChefProfile(int id)
        {
            // Find the chef profile associated with this user
            var chef = await _context.Chefs.FirstOrDefaultAsync(c => c.userId == id);
            
            if (chef == null)
                return NotFound(new { message = "Chef profile not found" });

            // Delete the chef profile
            _context.Chefs.Remove(chef);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Chef profile deleted successfully" });
        }

        // POST: api/ManageUser/upload-certification/{id}
        [HttpPost("upload-certification/{id}")]
        public async Task<IActionResult> UploadCertificationImage(int id, [FromForm] IFormFile file)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only images are allowed." });

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 5MB limit" });

            try
            {
                var certDir = Path.Combine(_env.WebRootPath, "certifications");
                if (!Directory.Exists(certDir))
                    Directory.CreateDirectory(certDir);

                // Generate unique filename
                var fileName = $"cert_{id}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(certDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"{Request.Scheme}://{Request.Host}/certifications/{fileName}";

                return Ok(new
                {
                    message = "Certification uploaded successfully",
                    certificationImageUrl = fileUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading file", error = ex.Message });
            }
        }

        // PUT: api/ManageUser/update-chef/{userId}
        [HttpPut("update-chef/{userId}")]
        public async Task<IActionResult> UpdateChefProfile(int userId, [FromBody] UpdateChefDTO dto)
        {
            var chef = await _context.Chefs.FirstOrDefaultAsync(c => c.userId == userId);
            if (chef == null)
                return NotFound(new { message = "Chef profile not found" });

            // Update chef fields
            if (!string.IsNullOrWhiteSpace(dto.specialtyCuisine))
                chef.specialtyCuisine = dto.specialtyCuisine;

            if (dto.yearsOfExperience >= 0)
                chef.yearsOfExperience = dto.yearsOfExperience;

            if (dto.certificationName != null)
                chef.certificationName = dto.certificationName;

            if (dto.certificationImageUrl != null)
                chef.certificationImageUrl = dto.certificationImageUrl;

            if (dto.portfolioLink != null)
                chef.portfolioLink = dto.portfolioLink;

            if (!string.IsNullOrWhiteSpace(dto.biography))
                chef.biography = dto.biography;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Chef profile updated successfully" });
        }

    }
}