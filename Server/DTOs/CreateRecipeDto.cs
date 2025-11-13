namespace Server.DTOs
{
    public class CreateRecipeDto
    {
        public int chefId { get; set; }
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string recipeImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty; // Comma-separated
        public string steps { get; set; } = string.Empty; // Newline-separated
    }
}