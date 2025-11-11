namespace Server.Models
{
    public class Recipe
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string recipeImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty; // Comma-separated
        public string steps { get; set; } = string.Empty; // Newline-separated
        public DateTime createdAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? chef { get; set; }
        public ICollection<RecipeReview> reviews { get; set; } = new List<RecipeReview>();
    }
}