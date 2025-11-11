namespace Server.DTOs
{
    public class ReviewChefApplicationDto
    {
        public string status { get; set; } // "Approved" or "Rejected"
        public string adminRemarks { get; set; }
    }
}