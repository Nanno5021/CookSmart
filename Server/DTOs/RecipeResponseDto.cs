namespace Server.DTOs
{
    public class RecipeResponseDto
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string chefName { get; set; } = string.Empty;
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string recipeImage { get; set; } = string.Empty;
        public List<string> ingredients { get; set; } = new List<string>();
        public List<string> steps { get; set; } = new List<string>();
        public DateTime createdAt { get; set; }
        public double averageRating { get; set; }
        public int totalReviews { get; set; }
    }
}