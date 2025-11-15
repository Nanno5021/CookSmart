import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Upload } from "lucide-react";
import Navbar from "../../components/Navbar";
import { createChefApplication } from "../../api/chefApplicationApi";
import { uploadCertificationImage } from "../../api/chefApplicationApi";

function RequestChefAccountPage() {
  const navigate = useNavigate();

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"));

  // Form states
  const [specialtyCuisine, setSpecialtyCuisine] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [certificationName, setCertificationName] = useState("");
  const [certificationImageUrl, setCertificationImageUrl] = useState("");
  const [certImageFile, setCertImageFile] = useState(null);
  const [certImagePreview, setCertImagePreview] = useState("");
  const [isUploadingCertImage, setIsUploadingCertImage] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [biography, setBiography] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCertImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setCertImageFile(file);
      setCertImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadCertImage = async () => {
    if (!certImageFile) {
      alert("Please select an image first");
      return;
    }

    setIsUploadingCertImage(true);
    try {
      const result = await uploadCertificationImage(certImageFile);
      setCertificationImageUrl(result.imageUrl);
      alert("Certification image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certification image:", error);
      alert("Failed to upload certification image. Please try again.");
    } finally {
      setIsUploadingCertImage(false);
    }
  };

  const handleRemoveCertImage = () => {
    setCertImageFile(null);
    setCertImagePreview("");
    setCertificationImageUrl("");
  };

  const handleSubmit = async () => {
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

    if (certImageFile && !certificationImageUrl) {
      alert("Please upload the selected certification image before submitting");
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
      
      setSpecialtyCuisine("");
      setYearsOfExperience("");
      setCertificationName("");
      setCertificationImageUrl("");
      setCertImageFile(null);
      setCertImagePreview("");
      setPortfolioLink("");
      setBiography("");
      
      navigate("/");
    } catch (error) {
      console.error("Error submitting chef application:", error);
      
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
            <label className="block text-sm font-medium mb-2">Certification Image *</label>
            
            {certImagePreview ? (
              <div className="relative">
                <img 
                  src={certImagePreview} 
                  alt="Certification Preview" 
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <button
                  onClick={handleRemoveCertImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full"
                  disabled={isSubmitting}
                >
                  <X size={20} />
                </button>
                {!certificationImageUrl && (
                  <button
                    onClick={handleUploadCertImage}
                    disabled={isUploadingCertImage || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {isUploadingCertImage ? "Uploading..." : "Upload Certification Image"}
                  </button>
                )}
                {certificationImageUrl && (
                  <p className="text-green-400 text-sm mt-2"> Certification image uploaded successfully</p>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
                <Upload size={40} className="text-gray-400 mb-2" />
                <span className="text-gray-400">Click to select certification image</span>
                <span className="text-gray-500 text-sm">Max 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCertImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
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