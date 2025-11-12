using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/enrollments
        [HttpPost]
        public async Task<ActionResult<EnrollmentResponseDto>> CreateEnrollment(CreateEnrollmentDto dto)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(dto.userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Check if course exists and get chef info
            var course = await _context.Courses
                .Include(c => c.chef) // This now references User, not Chef entity
                .FirstOrDefaultAsync(c => c.id == dto.courseId);
            
            if (course == null)
            {
                return NotFound("Course not found");
            }

            // Get chef details from Chef table if available
            var chefDetails = await _context.Chefs
                .FirstOrDefaultAsync(c => c.userId == course.chefId);

            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.userId == dto.userId && e.courseId == dto.courseId);

            if (existingEnrollment != null)
            {
                return BadRequest("User is already enrolled in this course");
            }

            var enrollment = new Enrollment
            {
                userId = dto.userId,
                courseId = dto.courseId,
                enrolledAt = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            var response = new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = user.username,
                courseName = course.courseName,
                chefName = course.chef?.username ?? "Unknown Chef", // Get from User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            };

            return CreatedAtAction(nameof(GetEnrollmentById), new { id = enrollment.id }, response);
        }

        // GET: api/enrollments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EnrollmentResponseDto>> GetEnrollmentById(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                    .ThenInclude(c => c.chef) // Include the chef (User)
                .FirstOrDefaultAsync(e => e.id == id);

            if (enrollment == null)
            {
                return NotFound();
            }

            var response = new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = enrollment.User?.username ?? "Unknown",
                courseName = enrollment.Course?.courseName ?? "Unknown Course",
                chefName = enrollment.Course?.chef?.username ?? "Unknown Chef", // From User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            };

            return Ok(response);
        }

        // GET: api/enrollments/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<EnrollmentResponseDto>>> GetEnrollmentsByUser(int userId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                    .ThenInclude(c => c.chef) // Include the chef (User)
                .Where(e => e.userId == userId)
                .OrderByDescending(e => e.enrolledAt)
                .ToListAsync();

            var response = enrollments.Select(enrollment => new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = enrollment.User?.username ?? "Unknown",
                courseName = enrollment.Course?.courseName ?? "Unknown Course",
                chefName = enrollment.Course?.chef?.username ?? "Unknown Chef", // From User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            }).ToList();

            return Ok(response);
        }

        // GET: api/enrollments/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<EnrollmentResponseDto>>> GetEnrollmentsByCourse(int courseId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                    .ThenInclude(c => c.chef) // Include the chef (User)
                .Where(e => e.courseId == courseId)
                .OrderByDescending(e => e.enrolledAt)
                .ToListAsync();

            var response = enrollments.Select(enrollment => new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = enrollment.User?.username ?? "Unknown",
                courseName = enrollment.Course?.courseName ?? "Unknown Course",
                chefName = enrollment.Course?.chef?.username ?? "Unknown Chef", // From User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            }).ToList();

            return Ok(response);
        }

        // GET: api/enrollments/user/{userId}/course/{courseId}
        [HttpGet("user/{userId}/course/{courseId}")]
        public async Task<ActionResult<EnrollmentResponseDto>> GetEnrollmentByUserAndCourse(int userId, int courseId)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                    .ThenInclude(c => c.chef) // Include the chef (User)
                .FirstOrDefaultAsync(e => e.userId == userId && e.courseId == courseId);

            if (enrollment == null)
            {
                return NotFound();
            }

            var response = new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = enrollment.User?.username ?? "Unknown",
                courseName = enrollment.Course?.courseName ?? "Unknown Course",
                chefName = enrollment.Course?.chef?.username ?? "Unknown Chef", // From User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            };

            return Ok(response);
        }

        // PUT: api/enrollments/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<EnrollmentResponseDto>> UpdateEnrollment(int id, UpdateEnrollmentDto dto)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                    .ThenInclude(c => c.chef) // Include the chef (User)
                .FirstOrDefaultAsync(e => e.id == id);

            if (enrollment == null)
            {
                return NotFound();
            }

            enrollment.progress = dto.progress;
            enrollment.completed = dto.completed;
            
            if (dto.completed && !enrollment.completed)
            {
                enrollment.completedAt = DateTime.UtcNow;
            }
            else if (!dto.completed)
            {
                enrollment.completedAt = null;
            }

            await _context.SaveChangesAsync();

            var response = new EnrollmentResponseDto
            {
                id = enrollment.id,
                userId = enrollment.userId,
                courseId = enrollment.courseId,
                userName = enrollment.User?.username ?? "Unknown",
                courseName = enrollment.Course?.courseName ?? "Unknown Course",
                chefName = enrollment.Course?.chef?.username ?? "Unknown Chef", // From User table
                enrolledAt = enrollment.enrolledAt,
                progress = enrollment.progress,
                completed = enrollment.completed,
                completedAt = enrollment.completedAt
            };

            return Ok(response);
        }

        // DELETE: api/enrollments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnrollment(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/enrollments/user/{userId}/enrolled
        [HttpGet("user/{userId}/enrolled")]
        public async Task<ActionResult<bool>> IsUserEnrolled(int userId, [FromQuery] int courseId)
        {
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.userId == userId && e.courseId == courseId);

            return Ok(isEnrolled);
        }
    }
}