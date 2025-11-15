using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Server.Data;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace Server.Services
{
    public class DbJsonUpdater : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly string _filePath;

        public DbJsonUpdater(IServiceProvider serviceProvider, IWebHostEnvironment env)
        {
            _serviceProvider = serviceProvider;
            _filePath = Path.Combine(env.ContentRootPath, "app.json");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await UpdateJsonFileAsync();
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task UpdateJsonFileAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var dbData = new
                {
                    Users = await context.Users.ToListAsync(),
                    Posts = await context.Posts.ToListAsync(),
                    Comments = await context.Comments.ToListAsync(),
                    PostLikes = await context.PostLikes.ToListAsync(),
                    CommentLikes = await context.CommentLikes.ToListAsync(),
                    PostViews = await context.PostViews.ToListAsync(),
                    Courses = await context.Courses.ToListAsync(),
                    CourseSections = await context.CourseSections.ToListAsync(),
                    QuizQuestions = await context.QuizQuestions.ToListAsync(),
                    CourseReviews = await context.CourseReviews.ToListAsync(),
                    Enrollments = await context.Enrollments.ToListAsync(),
                    Recipes = await context.Recipes.ToListAsync(),
                    RecipeReviews = await context.RecipeReviews.ToListAsync(),
                    Chefs = await context.Chefs.ToListAsync(),
                    ChefApplications = await context.ChefApplications.ToListAsync(),
                    OtpVerifications = await context.OtpVerifications.ToListAsync()
                };

                string json = JsonConvert.SerializeObject(dbData, Formatting.Indented,
                    new JsonSerializerSettings
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });

                await File.WriteAllTextAsync(_filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to update JSON: {ex.Message}");
            }
        }
    }
}
