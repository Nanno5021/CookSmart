using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// 1️⃣ Add Controllers & CORS
// ---------------------------
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// ---------------------------
// 2️⃣ Database Configuration (SQLite)
// ---------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------------------------
// 3️⃣ JWT Authentication
// ---------------------------
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

if (string.IsNullOrEmpty(key))
    throw new InvalidOperationException("JWT Key is not configured in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });


builder.Services.AddAuthorization();

// ---------------------------
// 4️⃣ OpenAPI / Swagger (optional)
// ---------------------------
builder.Services.AddOpenApi();

// ---------------------------
// 5️⃣ Build App
// ---------------------------
var app = builder.Build();
app.UseStaticFiles(); // enable serving files from wwwroot

// ---------------------------
// 6️⃣ Middleware Order (important!)
// ---------------------------
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// ✅ These must come BEFORE app.MapControllers()
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


