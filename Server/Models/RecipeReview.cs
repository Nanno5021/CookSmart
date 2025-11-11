namespace Server.Models
{
    public class RecipeReview
    {
        public int id { get; set; }
        public int recipeId { get; set; }
        public int userId { get; set; }
        public int rating { get; set; } // 1-5
        public string comment { get; set; } = string.Empty;
        public DateTime reviewDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Recipe? recipe { get; set; }
        public User? user { get; set; }
    }
}