import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import { fetchProfile, updateProfile } from "../api/profileapi";

function EditProfilePage() {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    id: null,
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    profilePic: picture,
  });

  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(picture);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // --------------------------
  // Load profile data
  // --------------------------
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);

      // Load cached user for instant UI
      try {
        const cached = localStorage.getItem("user");
        if (cached) {
          const u = JSON.parse(cached);
          if (mounted) {
            setProfileData((prev) => ({
              ...prev,
              id: u.id ?? prev.id,
              fullName: u.fullName ?? prev.fullName,
              username: u.username ?? prev.username,
              email: u.email ?? prev.email,
              phone: u.phone ?? prev.phone,
            }));
            setPreviewImage(u.profilePic ?? picture);
          }
        }
      } catch (e) {
        console.warn("Failed to read cached user:", e);
      }

      // Fetch authoritative profile from server
      try {
        const data = await fetchProfile();
        if (!data) {
          setError("No profile data returned from server.");
          return;
        }

        if (mounted) {
          setProfileData({
            id: data.id ?? null,
            fullName: data.fullName ?? "",
            username: data.username ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            password: "",
            profilePic: data.avatarUrl ?? picture,
          });
          setPreviewImage(data.avatarUrl ?? picture);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        if (mounted) setError(err.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------
  // Handle image change
  // --------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5 MB.");
      return;
    }

    setNewProfilePic(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --------------------------
  // Upload avatar to backend
  // --------------------------
  const uploadAvatar = async (file) => {
    if (!file) return null;

    const token = getToken();
    if (!token) throw new Error("Missing auth token");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // DO NOT set Content-Type
      },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Avatar upload failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    return json.avatarUrl || null;
  };

  // --------------------------
  // Handle save changes
  // --------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let avatarUrl = null;

      if (newProfilePic) {
        avatarUrl = await uploadAvatar(newProfilePic);
        setPreviewImage(avatarUrl || previewImage);
      }

      // Payload for profile update
      const payload = {
        fullName: profileData.fullName,
        phone: profileData.phone,
      };
      if (avatarUrl) payload.avatarUrl = avatarUrl;

      const resp = await updateProfile(payload);

      // Update cached local user
      const cached = localStorage.getItem("user");
      let userObj = cached ? JSON.parse(cached) : {};
      userObj = {
        ...userObj,
        fullName: resp.fullName ?? profileData.fullName,
        phone: resp.phone ?? profileData.phone,
      };
      if (avatarUrl) userObj.profilePic = avatarUrl;
      else if (previewImage) userObj.profilePic = previewImage;

      localStorage.setItem("user", JSON.stringify(userObj));

      alert("Profile updated successfully.");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile.");
      alert("Failed to update profile. See console or network for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/profile");

  // --------------------------
  // Loading state
  // --------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-gray-400">Loading profile…</div>
      </div>
    );
  }

  // --------------------------
  // JSX
  // --------------------------
  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center">
      <Navbar />

      <div
        className="w-full max-w-2xl mt-10 p-8 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
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

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={previewImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <label className="cursor-pointer">
              <div className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13l2.5 3L14 11l4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
              Avatars are uploaded to the server and saved to your profile (max 5 MB).
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
            />
          </div>

          {/* Username (disabled) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={profileData.username}
              disabled
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed here.
            </p>
          </div>

          {/* Email (disabled) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email changes require verification and are not supported here.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
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

          {/* Password (not implemented) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={profileData.password}
              onChange={(e) =>
                setProfileData({ ...profileData, password: e.target.value })
              }
              className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition"
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password changes are not implemented on the server yet.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-white text-black hover:bg-gray-300"} font-semibold py-3 rounded-lg transition mt-8`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
