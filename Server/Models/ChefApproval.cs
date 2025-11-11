namespace Server.Models 
{
    public class ChefApproval
    {
        public int id { get; set; }
        public int userid { get; set; }
        public string username { get; set; } = "";
        public bool isApproved { get; set; }
        public DateTime approvalDate { get; set; }
    }
}