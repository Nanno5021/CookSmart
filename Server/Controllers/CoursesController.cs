using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetAllCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Chef)
                .Include(c => c.Sections)
                .Include(c => c.QuizQuestions)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                Id = c.Id,
                ChefId = c.ChefId,
                ChefName = c.Chef?.Username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = c.CourseName,
                CourseImage = c.CourseImage,
                Ingredients = c.Ingredients,
                Difficulty = c.Difficulty,
                EstimatedTime = c.EstimatedTime,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                Sections = c.Sections.OrderBy(s => s.SectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.Id,
                    SectionTitle = s.SectionTitle,
                    ContentType = s.ContentType,
                    Content = s.Content,
                    SectionOrder = s.SectionOrder
                }).ToList(),
                QuizQuestions = c.QuizQuestions.OrderBy(q => q.QuestionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = new List<string> { q.Option1, q.Option2, q.Option3, q.Option4 },
                    Answer = q.CorrectAnswer,
                    QuestionOrder = q.QuestionOrder
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        // GET: api/courses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseResponseDto>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Chef)
                .Include(c => c.Sections)
                .Include(c => c.QuizQuestions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            var response = new CourseResponseDto
            {
                Id = course.Id,
                ChefId = course.ChefId,
                ChefName = course.Chef?.Username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = course.CourseName,
                CourseImage = course.CourseImage,
                Ingredients = course.Ingredients,
                Difficulty = course.Difficulty,
                EstimatedTime = course.EstimatedTime,
                Description = course.Description,
                CreatedAt = course.CreatedAt,
                Sections = course.Sections.OrderBy(s => s.SectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.Id,
                    SectionTitle = s.SectionTitle,
                    ContentType = s.ContentType,
                    Content = s.Content,
                    SectionOrder = s.SectionOrder
                }).ToList(),
                QuizQuestions = course.QuizQuestions.OrderBy(q => q.QuestionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = new List<string> { q.Option1, q.Option2, q.Option3, q.Option4 },
                    Answer = q.CorrectAnswer,
                    QuestionOrder = q.QuestionOrder
                }).ToList()
            };

            return Ok(response);
        }

        // GET: api/courses/chef/{chefId}
        [HttpGet("chef/{chefId}")]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetCoursesByChef(int chefId)
        {
            var courses = await _context.Courses
                .Include(c => c.Chef)
                .Include(c => c.Sections)
                .Include(c => c.QuizQuestions)
                .Where(c => c.ChefId == chefId)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                Id = c.Id,
                ChefId = c.ChefId,
                ChefName = c.Chef?.Username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = c.CourseName,
                CourseImage = c.CourseImage,
                Ingredients = c.Ingredients,
                Difficulty = c.Difficulty,
                EstimatedTime = c.EstimatedTime,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                Sections = c.Sections.OrderBy(s => s.SectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.Id,
                    SectionTitle = s.SectionTitle,
                    ContentType = s.ContentType,
                    Content = s.Content,
                    SectionOrder = s.SectionOrder
                }).ToList(),
                QuizQuestions = c.QuizQuestions.OrderBy(q => q.QuestionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = new List<string> { q.Option1, q.Option2, q.Option3, q.Option4 },
                    Answer = q.CorrectAnswer,
                    QuestionOrder = q.QuestionOrder
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        // POST: api/courses
        [HttpPost]
        public async Task<ActionResult<CourseResponseDto>> CreateCourse(CreateCourseDto dto)
        {
            // Temporarily skip chef validation - you can uncomment this later
            // var chef = await _context.Users.FindAsync(dto.ChefId);
            // if (chef == null)
            // {
            //     return BadRequest("Chef not found");
            // }

            var course = new Course
            {
                ChefId = 1, // Use default ChefId of 1 if not provided
                CourseName = dto.CourseName,
                CourseImage = dto.CourseImage,
                Ingredients = dto.Ingredients,
                Difficulty = dto.Difficulty,
                EstimatedTime = dto.EstimatedTime,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Add sections
            foreach (var sectionDto in dto.Sections)
            {
                var section = new CourseSection
                {
                    CourseId = course.Id,
                    SectionTitle = sectionDto.SectionTitle,
                    ContentType = sectionDto.ContentType,
                    Content = sectionDto.Content,
                    SectionOrder = sectionDto.SectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add quiz questions
            foreach (var quizDto in dto.QuizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    CourseId = course.Id,
                    Question = quizDto.Question,
                    Option1 = quizDto.Option1,
                    Option2 = quizDto.Option2,
                    Option3 = quizDto.Option3,
                    Option4 = quizDto.Option4,
                    CorrectAnswer = quizDto.CorrectAnswer,
                    QuestionOrder = quizDto.QuestionOrder
                };
                _context.QuizQuestions.Add(quiz);
            }

            await _context.SaveChangesAsync();

            // Return the created course
            return await GetCourse(course.Id);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, CreateCourseDto dto)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                .Include(c => c.QuizQuestions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            // Update course details
            course.CourseName = dto.CourseName;
            course.CourseImage = dto.CourseImage;
            course.Ingredients = dto.Ingredients;
            course.Difficulty = dto.Difficulty;
            course.EstimatedTime = dto.EstimatedTime;
            course.Description = dto.Description;

            // Remove old sections and quiz questions
            _context.CourseSections.RemoveRange(course.Sections);
            _context.QuizQuestions.RemoveRange(course.QuizQuestions);

            // Add new sections
            foreach (var sectionDto in dto.Sections)
            {
                var section = new CourseSection
                {
                    CourseId = course.Id,
                    SectionTitle = sectionDto.SectionTitle,
                    ContentType = sectionDto.ContentType,
                    Content = sectionDto.Content,
                    SectionOrder = sectionDto.SectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add new quiz questions
            foreach (var quizDto in dto.QuizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    CourseId = course.Id,
                    Question = quizDto.Question,
                    Option1 = quizDto.Option1,
                    Option2 = quizDto.Option2,
                    Option3 = quizDto.Option3,
                    Option4 = quizDto.Option4,
                    CorrectAnswer = quizDto.CorrectAnswer,
                    QuestionOrder = quizDto.QuestionOrder
                };
                _context.QuizQuestions.Add(quiz);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/courses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}