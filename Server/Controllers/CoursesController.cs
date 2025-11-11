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
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                Id = c.id,
                ChefId = c.chefId,
                ChefName = c.chef?.username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = c.courseName,
                CourseImage = c.courseImage,
                Ingredients = c.ingredients,
                Difficulty = c.difficulty,
                EstimatedTime = c.estimatedTime,
                Description = c.description,
                CreatedAt = c.createdAt,
                Sections = c.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.id,
                    SectionTitle = s.sectionTitle,
                    ContentType = s.contentType,
                    Content = s.content,
                    SectionOrder = s.sectionOrder
                }).ToList(),
                QuizQuestions = c.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.id,
                    Question = q.question,
                    Options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    Answer = q.correctAnswer,
                    QuestionOrder = q.questionOrder
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        // GET: api/courses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseResponseDto>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound();
            }

            var response = new CourseResponseDto
            {
                Id = course.id,
                ChefId = course.chefId,
                ChefName = course.chef?.username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = course.courseName,
                CourseImage = course.courseImage,
                Ingredients = course.ingredients,
                Difficulty = course.difficulty,
                EstimatedTime = course.estimatedTime,
                Description = course.description,
                CreatedAt = course.createdAt,
                Sections = course.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.id,
                    SectionTitle = s.sectionTitle,
                    ContentType = s.contentType,
                    Content = s.content,
                    SectionOrder = s.sectionOrder
                }).ToList(),    
                QuizQuestions = course.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.id,
                    Question = q.question,
                    Options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    Answer = q.correctAnswer,
                    QuestionOrder = q.questionOrder
                }).ToList()
            };

            return Ok(response);
        }

        // GET: api/courses/chef/{chefId}
        [HttpGet("chef/{chefId}")]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetCoursesByChef(int chefId)
        {
            var courses = await _context.Courses
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .Where(c => c.chefId == chefId)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                Id = c.id,
                ChefId = c.chefId,
                ChefName = c.chef?.username ?? "Unknown Chef",
                ChefImage = "", // Temporarily removed until profile images are implemented
                CourseName = c.courseName,
                CourseImage = c.courseImage,
                Ingredients = c.ingredients,
                Difficulty = c.difficulty,
                EstimatedTime = c.estimatedTime,
                Description = c.description,
                CreatedAt = c.createdAt,
                Sections = c.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    Id = s.id,
                    SectionTitle = s.sectionTitle,
                    ContentType = s.contentType,
                    Content = s.content,
                    SectionOrder = s.sectionOrder
                }).ToList(),
                QuizQuestions = c.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    Id = q.id,
                    Question = q.question,
                    Options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    Answer = q.correctAnswer,
                    QuestionOrder = q.questionOrder
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
                chefId = 1, // Use default ChefId of 1 if not provided
                courseName = dto.CourseName,
                courseImage = dto.CourseImage,
                ingredients = dto.Ingredients,
                difficulty = dto.Difficulty,
                estimatedTime = dto.EstimatedTime,
                description = dto.Description,
                createdAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Add sections
            foreach (var sectionDto in dto.Sections)
            {
                var section = new CourseSection
                {
                    courseId = course.id,
                    sectionTitle = sectionDto.SectionTitle,
                    contentType = sectionDto.ContentType,
                    content = sectionDto.Content,
                    sectionOrder = sectionDto.SectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add quiz questions
            foreach (var quizDto in dto.QuizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    courseId = course.id,
                    question = quizDto.Question,
                    option1 = quizDto.Option1,
                    option2 = quizDto.Option2,
                    option3 = quizDto.Option3,
                    option4 = quizDto.Option4,
                    correctAnswer = quizDto.CorrectAnswer,
                    questionOrder = quizDto.QuestionOrder
                };
                _context.QuizQuestions.Add(quiz);
            }

            await _context.SaveChangesAsync();

            // Return the created course
            return await GetCourse(course.id);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, CreateCourseDto dto)
        {
            var course = await _context.Courses
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound();
            }

            // Update course details
            course.courseName = dto.CourseName;
            course.courseImage = dto.CourseImage;
            course.ingredients = dto.Ingredients;
            course.difficulty = dto.Difficulty;
            course.estimatedTime = dto.EstimatedTime;
            course.description = dto.Description;

            // Remove old sections and quiz questions
            _context.CourseSections.RemoveRange(course.sections);
            _context.QuizQuestions.RemoveRange(course.quizQuestions);

            // Add new sections
            foreach (var sectionDto in dto.Sections)
            {
                var section = new CourseSection
                {
                    courseId = course.id,
                    sectionTitle = sectionDto.SectionTitle,
                    contentType = sectionDto.ContentType,
                    content = sectionDto.Content,
                    sectionOrder = sectionDto.SectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add new quiz questions
            foreach (var quizDto in dto.QuizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    courseId = course.id,
                    question = quizDto.Question,
                    option1 = quizDto.Option1,
                    option2 = quizDto.Option2,
                    option3 = quizDto.Option3,
                    option4 = quizDto.Option4,
                    correctAnswer = quizDto.CorrectAnswer,
                    questionOrder = quizDto.QuestionOrder
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