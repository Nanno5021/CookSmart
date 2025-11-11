using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Chefs",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    userId = table.Column<int>(type: "INTEGER", nullable: false),
                    specialtyCuisine = table.Column<string>(type: "TEXT", nullable: false),
                    yearsOfExperience = table.Column<int>(type: "INTEGER", nullable: false),
                    certificationName = table.Column<string>(type: "TEXT", nullable: false),
                    certificationImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    portfolioLink = table.Column<string>(type: "TEXT", nullable: false),
                    biography = table.Column<string>(type: "TEXT", nullable: false),
                    rating = table.Column<double>(type: "REAL", nullable: false),
                    totalReviews = table.Column<int>(type: "INTEGER", nullable: false),
                    approvedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chefs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    fullName = table.Column<string>(type: "TEXT", nullable: false),
                    username = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: false),
                    password = table.Column<string>(type: "TEXT", nullable: false),
                    role = table.Column<string>(type: "TEXT", nullable: false),
                    avatarUrl = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ChefApplications",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    userId = table.Column<int>(type: "INTEGER", nullable: false),
                    specialtyCuisine = table.Column<string>(type: "TEXT", nullable: false),
                    yearsOfExperience = table.Column<int>(type: "INTEGER", nullable: false),
                    certificationName = table.Column<string>(type: "TEXT", nullable: false),
                    certificationImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    portfolioLink = table.Column<string>(type: "TEXT", nullable: false),
                    biography = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    adminRemarks = table.Column<string>(type: "TEXT", nullable: false),
                    dateApplied = table.Column<DateTime>(type: "TEXT", nullable: false),
                    dateReviewed = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChefApplications", x => x.id);
                    table.ForeignKey(
                        name: "FK_ChefApplications_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    chefId = table.Column<int>(type: "INTEGER", nullable: false),
                    courseName = table.Column<string>(type: "TEXT", nullable: false),
                    courseImage = table.Column<string>(type: "TEXT", nullable: false),
                    ingredients = table.Column<string>(type: "TEXT", nullable: false),
                    difficulty = table.Column<string>(type: "TEXT", nullable: false),
                    estimatedTime = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.id);
                    table.ForeignKey(
                        name: "FK_Courses_Users_chefId",
                        column: x => x.chefId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    content = table.Column<string>(type: "TEXT", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    rating = table.Column<int>(type: "INTEGER", nullable: false),
                    comments = table.Column<int>(type: "INTEGER", nullable: false),
                    views = table.Column<int>(type: "INTEGER", nullable: false),
                    imageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    userId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Posts_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    chefId = table.Column<int>(type: "INTEGER", nullable: false),
                    recipeName = table.Column<string>(type: "TEXT", nullable: false),
                    cuisine = table.Column<string>(type: "TEXT", nullable: false),
                    recipeImage = table.Column<string>(type: "TEXT", nullable: false),
                    ingredients = table.Column<string>(type: "TEXT", nullable: false),
                    steps = table.Column<string>(type: "TEXT", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.id);
                    table.ForeignKey(
                        name: "FK_Recipes_Users_chefId",
                        column: x => x.chefId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseReviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    courseId = table.Column<int>(type: "INTEGER", nullable: false),
                    userId = table.Column<int>(type: "INTEGER", nullable: false),
                    rating = table.Column<int>(type: "INTEGER", nullable: false),
                    comment = table.Column<string>(type: "TEXT", nullable: false),
                    reviewDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseReviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_CourseReviews_Courses_courseId",
                        column: x => x.courseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseReviews_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "CourseSections",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    courseId = table.Column<int>(type: "INTEGER", nullable: false),
                    sectionTitle = table.Column<string>(type: "TEXT", nullable: false),
                    contentType = table.Column<string>(type: "TEXT", nullable: false),
                    content = table.Column<string>(type: "TEXT", nullable: false),
                    sectionOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseSections", x => x.id);
                    table.ForeignKey(
                        name: "FK_CourseSections_Courses_courseId",
                        column: x => x.courseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    courseId = table.Column<int>(type: "INTEGER", nullable: false),
                    question = table.Column<string>(type: "TEXT", nullable: false),
                    option1 = table.Column<string>(type: "TEXT", nullable: false),
                    option2 = table.Column<string>(type: "TEXT", nullable: false),
                    option3 = table.Column<string>(type: "TEXT", nullable: false),
                    option4 = table.Column<string>(type: "TEXT", nullable: false),
                    correctAnswer = table.Column<string>(type: "TEXT", nullable: false),
                    questionOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Courses_courseId",
                        column: x => x.courseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeReviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    recipeId = table.Column<int>(type: "INTEGER", nullable: false),
                    userId = table.Column<int>(type: "INTEGER", nullable: false),
                    rating = table.Column<int>(type: "INTEGER", nullable: false),
                    comment = table.Column<string>(type: "TEXT", nullable: false),
                    reviewDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeReviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_RecipeReviews_Recipes_recipeId",
                        column: x => x.recipeId,
                        principalTable: "Recipes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeReviews_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChefApplications_userId",
                table: "ChefApplications",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReviews_courseId_userId",
                table: "CourseReviews",
                columns: new[] { "courseId", "userId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseReviews_userId",
                table: "CourseReviews",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_chefId",
                table: "Courses",
                column: "chefId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseSections_courseId",
                table: "CourseSections",
                column: "courseId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_userId",
                table: "Posts",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_courseId",
                table: "QuizQuestions",
                column: "courseId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeReviews_recipeId_userId",
                table: "RecipeReviews",
                columns: new[] { "recipeId", "userId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecipeReviews_userId",
                table: "RecipeReviews",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_chefId",
                table: "Recipes",
                column: "chefId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChefApplications");

            migrationBuilder.DropTable(
                name: "Chefs");

            migrationBuilder.DropTable(
                name: "CourseReviews");

            migrationBuilder.DropTable(
                name: "CourseSections");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "RecipeReviews");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
