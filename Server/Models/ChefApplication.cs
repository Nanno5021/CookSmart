namespace Server.Models
{
    public class ChefApplication
    {
        public int id { get; set; }
        public int userId { get; set; }
        public User User { get; set; }
        public string specialtyCuisine { get; set; }
        public int yearsOfExperience { get; set; }
        public string certificationName { get; set; }
        public string certificationImageUrl { get; set; }
        public string portfolioLink { get; set; }
        public string biography { get; set; }

        public string status { get; set; } = "Pending";
        public string adminRemarks { get; set; } = string.Empty;
        public DateTime dateApplied { get; set; } = DateTime.Now;
        public DateTime? dateReviewed { get; set; }
    }
}