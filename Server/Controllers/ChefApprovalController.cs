using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTO;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChefApprovalController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChefApprovalController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ChefApproval/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<ChefApplicationDTO>>> GetPendingApplications()
        {
            var applications = await _context.ChefApplications
                .Where(a => a.status == "Pending")
                .Join(_context.Users,
                    app => app.userId,
                    user => user.id,
                    (app, user) => new ChefApplicationDTO
                    {
                        id = app.id,
                        userId = user.id,
                        fullName = user.fullName,
                        email = user.email,
                        specialtyCuisine = app.specialtyCuisine,
                        yearsOfExperience = app.yearsOfExperience,
                        certificationName = app.certificationName,
                        certificationImageUrl = app.certificationImageUrl,
                        portfolioLink = app.portfolioLink,
                        biography = app.biography,
                        status = app.status,
                        dateApplied = app.dateApplied
                    }).ToListAsync();

            return Ok(applications);
        }

        // GET: api/ChefApproval/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ChefApplicationDTO>> GetApplicationById(int id)
        {
            var application = await _context.ChefApplications
                .Where(a => a.id == id)
                .Join(_context.Users,
                    app => app.userId,
                    user => user.id,
                    (app, user) => new ChefApplicationDTO
                    {
                        id = app.id,
                        userId = user.id,
                        fullName = user.fullName,
                        email = user.email,
                        specialtyCuisine = app.specialtyCuisine,
                        yearsOfExperience = app.yearsOfExperience,
                        certificationName = app.certificationName,
                        certificationImageUrl = app.certificationImageUrl,
                        portfolioLink = app.portfolioLink,
                        biography = app.biography,
                        status = app.status,
                        dateApplied = app.dateApplied,
                        dateReviewed = app.dateReviewed,
                        adminRemarks = app.adminRemarks
                    }).FirstOrDefaultAsync();

            if (application == null)
                return NotFound(new { message = "Application not found" });

            return Ok(application);
        }

        // POST: api/ChefApproval/approve/{id}
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            var app = await _context.ChefApplications.FindAsync(id);
            if (app == null) return NotFound();

            var user = await _context.Users.FindAsync(app.userId);
            if (user == null) return NotFound();

            // Update user role
            user.role = "Chef";

            // Insert into Chef table
            var chef = new Chef
            {
                userId = user.id,
                specialtyCuisine = app.specialtyCuisine,
                yearsOfExperience = app.yearsOfExperience,
                certificationName = app.certificationName,
                certificationImageUrl = app.certificationImageUrl,
                portfolioLink = app.portfolioLink,
                biography = app.biography,
                approvedDate = DateTime.Now
            };

            _context.Chefs.Add(chef);

            // Mark application approved
            app.status = "Approved";
            app.dateReviewed = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Application Approved" });
        }

        // POST: api/ChefApproval/reject/{id}
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectApplication(int id, [FromBody] string remarks)
        {
            var app = await _context.ChefApplications.FindAsync(id);
            if (app == null) return NotFound();

            app.status = "Rejected";
            app.adminRemarks = remarks;
            app.dateReviewed = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Application Rejected" });
        }
    }
}