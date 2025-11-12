namespace Server.DTOs
{
    public class UpdateRecipeReviewDto
    {
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
    }
}