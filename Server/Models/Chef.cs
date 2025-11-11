public class Chef
{
    public int id { get; set; }
    public int userId { get; set; }

    public string specialtyCuisine { get; set; }
    public int yearsOfExperience { get; set; }
    public string certificationName { get; set; }
    public string certificationImageUrl { get; set; }
    public string portfolioLink { get; set; } 
    public string biography { get; set; }

    public double rating { get; set; } = 0.0;       
    public int totalReviews { get; set; } = 0;      
    public DateTime approvedDate { get; set; } = DateTime.Now;
}
