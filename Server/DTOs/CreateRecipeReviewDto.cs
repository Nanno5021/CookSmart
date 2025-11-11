namespace Server.DTOs
{
    public class CreateRecipeReviewDto
    {
        public int recipeId { get; set; }
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
    }
}