import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createChefApplication } from "../../api/chefApplicationApi";

function RequestChefAccountPage() {
  const navigate = useNavigate();

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"));

  // Form states
  const [specialtyCuisine, setSpecialtyCuisine] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [certificationName, setCertificationName] = useState("");
  const [certificationImageUrl, setCertificationImageUrl] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [biography, setBiography] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (
      !specialtyCuisine ||
      !yearsOfExperience ||
      !certificationName ||
      !certificationImageUrl ||
      !biography
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!currentUserId) {
      alert("Please log in to submit a chef application.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        specialtyCuisine,
        yearsOfExperience: parseInt(yearsOfExperience),
        certificationName,
        certificationImageUrl,
        portfolioLink,
        biography,
      };

      const response = await createChefApplication(applicationData, currentUserId);
      
      console.log("Chef application submitted:", response);
      alert("Your chef application has been submitted successfully! We will review it shortly.");
      
      // Clear form
      setSpecialtyCuisine("");
      setYearsOfExperience("");
      setCertificationName("");
      setCertificationImageUrl("");
      setPortfolioLink("");
      setBiography("");
      
      // Redirect to home or profile page
      navigate("/");
    } catch (error) {
      console.error("Error submitting chef application:", error);
      
      // Handle specific error messages
      if (error.message.includes("already have a pending application")) {
        alert("You already have a pending chef application. Please wait for admin review.");
      } else if (error.message.includes("already a chef")) {
        alert("You are already registered as a chef!");
      } else {
        alert("Failed to submit chef application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Request Chef Account</h1>

        <div className="bg-[#181818] rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Specialty Cuisine *</label>
            <input
              type="text"
              value={specialtyCuisine}
              onChange={(e) => setSpecialtyCuisine(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Italian, Japanese"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Years of Experience *</label>
            <input
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g., 5"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Certification Name *</label>
            <input
              type="text"
              value={certificationName}
              onChange={(e) => setCertificationName(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Culinary Arts Diploma"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Certification Image URL *</label>
            <input
              type="text"
              value={certificationImageUrl}
              onChange={(e) => setCertificationImageUrl(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/certificate.jpg"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Portfolio Link</label>
            <input
              type="text"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="https://portfolio.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Biography *</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-40 resize-none"
              placeholder="Write a short biography about yourself and your culinary experience..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestChefAccountPage;