import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera } from "lucide-react";
import Navbar from "../components/Navbar";
import { fetchMyProfile, updateMyProfile, uploadAvatar } from "../api/profileapi";

function EditProfilePage() {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });

  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMyProfile();
        
        setProfileData({
          fullName: data.fullName || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          avatarUrl: data.avatarUrl || "",
        });
        
        setPreviewImage(data.avatarUrl || null);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5 MB.");
      return;
    }

    setNewProfilePic(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let avatarUrl = profileData.avatarUrl;

      // Upload avatar if changed
      if (newProfilePic) {
        const uploadResult = await uploadAvatar(newProfilePic);
        avatarUrl = uploadResult.avatarUrl;
      }

      // Update profile
      const payload = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        avatarUrl: avatarUrl,
      };

      await updateMyProfile(payload);

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/profile");

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-gray-400">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center">
      <Navbar />

      <div
        className="w-full max-w-2xl mt-10 p-8 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white font-semibold transition"
            type="button"
            disabled={saving}
          >
            Cancel
          </button>
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <div className="w-16" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <label className="cursor-pointer">
              <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition">
                <Camera className="w-5 h-5" />
                <span className="font-semibold">Change Photo</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Max 5 MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          <hr className="border-gray-700" />

          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData({ ...profileData, fullName: e.target.value })
              }
              className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={profileData.username}
              disabled
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed
            </p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition"
              placeholder="Enter your phone number (optional)"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-300"
            } font-semibold py-3 rounded-lg transition mt-8`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;