using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChefApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ChefApplicationController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // POST: api/chefapplications
        [HttpPost]
        public async Task<ActionResult<ChefApplicationResponseDto>> CreateApplication(
            CreateChefApplicationDto dto, 
            [FromQuery] int userId)
        {
            // Validate user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Check if user already has a pending or approved application
            var existingApplication = await _context.ChefApplications
                .FirstOrDefaultAsync(a => a.userId == userId && 
                    (a.status == "Pending" || a.status == "Approved"));

            if (existingApplication != null)
            {
                if (existingApplication.status == "Approved")
                {
                    return BadRequest("You are already a chef");
                }
                return BadRequest("You already have a pending application");
            }

            // Check if user is already a chef
            var existingChef = await _context.Chefs
                .FirstOrDefaultAsync(c => c.userId == userId);

            if (existingChef != null)
            {
                return BadRequest("You are already a chef");
            }

            var application = new ChefApplication
            {
                userId = userId,
                specialtyCuisine = dto.specialtyCuisine,
                yearsOfExperience = dto.yearsOfExperience,
                certificationName = dto.certificationName,
                certificationImageUrl = dto.certificationImageUrl,
                portfolioLink = dto.portfolioLink ?? "",
                biography = dto.biography,
                status = "Pending",
                adminRemarks = "", 
                dateApplied = DateTime.UtcNow
            };

            _context.ChefApplications.Add(application);
            await _context.SaveChangesAsync();

            var response = new ChefApplicationResponseDto
            {
                id = application.id,
                userId = application.userId,
                username = user.username,
                email = user.email,
                specialtyCuisine = application.specialtyCuisine,
                yearsOfExperience = application.yearsOfExperience,
                certificationName = application.certificationName,
                certificationImageUrl = application.certificationImageUrl,
                portfolioLink = application.portfolioLink,
                biography = application.biography,
                status = application.status,
                adminRemarks = application.adminRemarks,
                dateApplied = application.dateApplied,
                dateReviewed = application.dateReviewed
            };

            return CreatedAtAction(nameof(GetApplicationById), new { id = application.id }, response);
        }

        // GET: api/chefapplications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ChefApplicationResponseDto>> GetApplicationById(int id)
        {
            var application = await _context.ChefApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.id == id);

            if (application == null)
            {
                return NotFound();
            }

            var response = new ChefApplicationResponseDto
            {
                id = application.id,
                userId = application.userId,
                username = application.User?.username ?? "Unknown",
                email = application.User?.email ?? "Unknown",
                specialtyCuisine = application.specialtyCuisine,
                yearsOfExperience = application.yearsOfExperience,
                certificationName = application.certificationName,
                certificationImageUrl = application.certificationImageUrl,
                portfolioLink = application.portfolioLink,
                biography = application.biography,
                status = application.status,
                adminRemarks = application.adminRemarks,
                dateApplied = application.dateApplied,
                dateReviewed = application.dateReviewed
            };

            return Ok(response);
        }

        // GET: api/chefapplications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ChefApplicationResponseDto>>> GetApplicationsByUser(int userId)
        {
            var applications = await _context.ChefApplications
                .Include(a => a.User)
                .Where(a => a.userId == userId)
                .OrderByDescending(a => a.dateApplied)
                .ToListAsync();

            var response = applications.Select(application => new ChefApplicationResponseDto
            {
                id = application.id,
                userId = application.userId,
                username = application.User?.username ?? "Unknown",
                email = application.User?.email ?? "Unknown",
                specialtyCuisine = application.specialtyCuisine,
                yearsOfExperience = application.yearsOfExperience,
                certificationName = application.certificationName,
                certificationImageUrl = application.certificationImageUrl,
                portfolioLink = application.portfolioLink,
                biography = application.biography,
                status = application.status,
                adminRemarks = application.adminRemarks,
                dateApplied = application.dateApplied,
                dateReviewed = application.dateReviewed
            }).ToList();

            return Ok(response);
        }

        // GET: api/chefapplications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChefApplicationResponseDto>>> GetAllApplications(
            [FromQuery] string status = null)
        {
            var query = _context.ChefApplications
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.status == status);
            }

            var applications = await query
                .OrderByDescending(a => a.dateApplied)
                .ToListAsync();

            var response = applications.Select(application => new ChefApplicationResponseDto
            {
                id = application.id,
                userId = application.userId,
                username = application.User?.username ?? "Unknown",
                email = application.User?.email ?? "Unknown",
                specialtyCuisine = application.specialtyCuisine,
                yearsOfExperience = application.yearsOfExperience,
                certificationName = application.certificationName,
                certificationImageUrl = application.certificationImageUrl,
                portfolioLink = application.portfolioLink,
                biography = application.biography,
                status = application.status,
                adminRemarks = application.adminRemarks,
                dateApplied = application.dateApplied,
                dateReviewed = application.dateReviewed
            }).ToList();

            return Ok(response);
        }

        // PUT: api/chefapplications/{id}/review
        [HttpPut("{id}/review")]
        public async Task<ActionResult<ChefApplicationResponseDto>> ReviewApplication(
            int id, 
            ReviewChefApplicationDto dto)
        {
            var application = await _context.ChefApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.id == id);

            if (application == null)
            {
                return NotFound("Application not found");
            }

            if (application.status != "Pending")
            {
                return BadRequest("Application has already been reviewed");
            }

            application.status = dto.status;
            application.adminRemarks = dto.adminRemarks ?? "";
            application.dateReviewed = DateTime.UtcNow;

            // If approved, create a Chef record
            if (dto.status == "Approved")
            {
                var existingChef = await _context.Chefs
                    .FirstOrDefaultAsync(c => c.userId == application.userId);

                if (existingChef == null)
                {
                    var newChef = new Chef
                    {
                        userId = application.userId,
                        specialtyCuisine = application.specialtyCuisine,
                        yearsOfExperience = application.yearsOfExperience,
                        certificationName = application.certificationName,
                        certificationImageUrl = application.certificationImageUrl,
                        portfolioLink = application.portfolioLink,
                        biography = application.biography,
                        rating = 0.0,
                        totalReviews = 0,
                        approvedDate = DateTime.UtcNow
                    };

                    _context.Chefs.Add(newChef);
                }
            }

            await _context.SaveChangesAsync();

            var response = new ChefApplicationResponseDto
            {
                id = application.id,
                userId = application.userId,
                username = application.User?.username ?? "Unknown",
                email = application.User?.email ?? "Unknown",
                specialtyCuisine = application.specialtyCuisine,
                yearsOfExperience = application.yearsOfExperience,
                certificationName = application.certificationName,
                certificationImageUrl = application.certificationImageUrl,
                portfolioLink = application.portfolioLink,
                biography = application.biography,
                status = application.status,
                adminRemarks = application.adminRemarks,
                dateApplied = application.dateApplied,
                dateReviewed = application.dateReviewed
            };

            return Ok(response);
        }

        // DELETE: api/chefapplications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id, [FromQuery] int userId)
        {
            var application = await _context.ChefApplications.FindAsync(id);

            if (application == null)
            {
                return NotFound();
            }

            // Only allow the user who created the application to delete it (and only if pending)
            if (application.userId != userId)
            {
                return Forbid();
            }

            if (application.status != "Pending")
            {
                return BadRequest("Cannot delete a reviewed application");
            }

            _context.ChefApplications.Remove(application);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpPost("upload-certification")]
        public async Task<ActionResult<object>> UploadCertificationImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid file type. Only image files are allowed.");
            }

            // Validate file size (5MB max)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest("File size exceeds 5MB limit");
            }

            try
            {
                // Save directly to wwwroot/certifications
                var uploadsFolder = Path.Combine(
                    _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), 
                    "certifications"
                );
                Directory.CreateDirectory(uploadsFolder);

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the URL pointing to /certifications folder
                var imageUrl = $"{Request.Scheme}://{Request.Host}/certifications/{uniqueFileName}";
                
                return Ok(new { imageUrl = imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading file: {ex.Message}");
            }
        }
    }
}
