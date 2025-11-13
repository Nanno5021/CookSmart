namespace Server.DTO
{
    public class RecipeDTO
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string chefName { get; set; } = string.Empty;
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string recipeImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string steps { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public double averageRating { get; set; }
        public int totalReviews { get; set; }
    }

    public class RecipeDetailDTO
    {
        public int id { get; set; }
        public int chefId { get; set; }
        public string chefName { get; set; } = string.Empty;
        public string chefAvatar { get; set; } = string.Empty;
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string recipeImage { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string steps { get; set; } = string.Empty;
        public DateTime createdAt { get; set; }
        public double averageRating { get; set; }
        public int totalReviews { get; set; }
        public List<RecipeReviewDTO> reviews { get; set; } = new List<RecipeReviewDTO>();
    }

    public class RecipeReviewDTO
    {
        public int id { get; set; }
        public int userId { get; set; }
        public string userName { get; set; } = string.Empty;
        public string userAvatar { get; set; } = string.Empty;
        public int rating { get; set; }
        public string comment { get; set; } = string.Empty;
        public DateTime reviewDate { get; set; }
    }

    public class UpdateRecipeDTO
    {
        public string recipeName { get; set; } = string.Empty;
        public string cuisine { get; set; } = string.Empty;
        public string ingredients { get; set; } = string.Empty;
        public string steps { get; set; } = string.Empty;
    }
}