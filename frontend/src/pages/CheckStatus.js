import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Award,
  Briefcase,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import { fetchChefApplicationsByUser } from "../api/chefApplicationApi";

function CheckStatus() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    if (!currentUserId) {
      setError("Please log in to view your applications");
      setLoading(false);
      return;
    }
    loadApplications();
  }, [currentUserId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChefApplicationsByUser(currentUserId);
      setApplications(data);
    } catch (err) {
      console.error("Error loading applications:", err);
      setError("Failed to load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "Rejected":
        return <XCircle className="text-red-500" size={20} />;
      case "Pending":
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 bg-opacity-20 text-green-500 border-green-500";
      case "Rejected":
        return "bg-red-500 bg-opacity-20 text-red-500 border-red-500";
      case "Pending":
      default:
        return "bg-yellow-500 bg-opacity-20 text-yellow-500 border-yellow-500";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Application Status</h1>
          <div className="bg-[#181818] rounded-xl p-8 text-center">
            <p className="text-gray-400">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pl-24">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Application Status</h1>
          <div className="bg-[#181818] rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadApplications}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Application Status</h1>
        </div>

        {applications.length === 0 ? (
          <div className="bg-[#181818] rounded-xl p-12 text-center">
            <FileText className="mx-auto text-gray-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-4">No Applications Found</h2>
            <p className="text-gray-400 mb-6">
              You haven't submitted any chef applications yet.
            </p>
            <button
              onClick={() => navigate("/requestchef")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              Apply for Chef Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden"
              >
                {/* Application Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Your Chef Application
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Applied: {formatDate(application.dateApplied)}</span>
                        </div>
                        {application.dateReviewed && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Reviewed: {formatDate(application.dateReviewed)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="font-semibold">{application.status}</span>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="text-blue-500" size={20} />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Username" value={application.username} />
                      <InfoField label="Email" value={application.email} />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="text-green-500" size={20} />
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField 
                        label="Specialty Cuisine" 
                        value={application.specialtyCuisine} 
                        icon={Award}
                      />
                      <InfoField 
                        label="Years of Experience" 
                        value={`${application.yearsOfExperience} years`} 
                        icon={Calendar}
                      />
                      <InfoField 
                        label="Certification" 
                        value={application.certificationName || "N/A"} 
                        icon={Award}
                      />
                      {application.portfolioLink && (
                        <InfoField 
                          label="Portfolio" 
                          value={application.portfolioLink} 
                          icon={LinkIcon}
                          isLink
                        />
                      )}
                    </div>
                  </div>

                  {/* Biography */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="text-purple-500" size={20} />
                      Biography
                    </h4>
                    <div className="bg-[#1f1f1f] rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {application.biography || "No biography provided"}
                      </p>
                    </div>
                  </div>

                  {/* Admin Remarks (if rejected) */}
                  {application.status === "Rejected" && application.adminRemarks && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
                        <XCircle size={20} />
                        Rejection Remarks
                      </h4>
                      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
                        <p className="text-gray-300">{application.adminRemarks}</p>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {application.status === "Approved" && (
                    <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-2 text-green-400">
                        Congratulations! 🎉
                      </h4>
                      <p className="text-gray-300">
                        Your chef application has been approved! You can now create recipes and courses.
                      </p>
                      <button
                        onClick={() => navigate("/chefrecipe")}
                        className="flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                      >
                        Go to Chef Dashboard
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {application.status === "Pending" && (
                    <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-2 text-yellow-400">
                        Application Under Review
                      </h4>
                      <p className="text-gray-300">
                        Your application is currently being reviewed by our admin team. 
                        You will be notified once a decision has been made.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable InfoField component
function InfoField({ label, value, icon: Icon, isLink = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 font-medium mb-2">{label}</label>
      <div className="flex items-center gap-3 bg-[#1f1f1f] rounded-lg p-3">
        {Icon && <Icon size={18} className="text-gray-500" />}
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {value}
          </a>
        ) : (
          <span className="text-white break-all">{value}</span>
        )}
      </div>
    </div>
  );
}

export default CheckStatus;