import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import imageIcon from "../assets/picture.png";
import { createPost, uploadPostImage } from "../api/post";
import { apiFetch } from "../api/apiClient"; // import apiFetch to call /profile/me

function PostBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState(location.state?.title || "");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);        // actual File
  const [imagePreview, setImagePreview] = useState(null);  // object URL for preview
  const [user, setUser] = useState({ username: "Anonymous", profilePic: picture });
  const [loadingUser, setLoadingUser] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Fetch current logged-in user from backend
  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const data = await apiFetch("/profile/me"); // GET api/profile/me
        if (mounted) {
          setUser({
            username: data.username || "Anonymous",
            profilePic: data.avatarUrl || picture,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (mounted) setUser({ username: "Anonymous", profilePic: picture });
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
      // revoke preview URL if set
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle file input change
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      return;
    }

    if (!f.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // optional size guard (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (f.size > maxBytes) {
      alert("Image too large. Max 5 MB.");
      return;
    }

    // revoke previous preview
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  // upload image file to server and return { imageUrl }
  const uploadPostImage = async (file) => {
    if (!file) return null;
    const token = localStorage.getItem("token");
    const url = "http://localhost:5037/api/posts/upload";

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      const data = await res.json(); // { imageUrl: "..." }
      return data; // return object
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Title and body cannot be empty.");
      return;
    }

    setIsPosting(true);

    try {
      let imageUrl = null;

      // 1️⃣ Upload the image first if selected
      if (imageFile) {
        try {
          const uploadRes = await uploadPostImage(imageFile); // { imageUrl: "..." }
          imageUrl = uploadRes.imageUrl; // now this works
        } catch (err) {
          console.error("Image upload failed:", err);
          alert("Failed to upload image: " + (err.message || err));
          setIsPosting(false);
          return;
        }
      }

      const postData = {
        title,
        content: body,
        imageUrl, // may be null
      };
      console.log("Posting data:", postData);
      const res = await createPost(postData);

      console.log("✅ Post created:", res);
      alert("Post created successfully!");

      // 4️⃣ Cleanup preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      setImageFile(null);
      setTitle("");
      setBody("");

      navigate("/");
    } catch (error) {
      console.error("❌ Error creating post:", error);
      alert(error.message || "Failed to create post");
      if (error.message?.includes("Unauthorized")) navigate("/login");
    } finally {
      setIsPosting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-black">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-[#181818] text-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white font-semibold"
            disabled={isUploading || isPosting}
          >
            Cancel
          </button>
          <h2 className="text-xl font-bold">New Blog</h2>
          <div className="w-16" />
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.profilePic}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="font-semibold text-lg">{user.username}</span>
        </div>

        {/* Image Placeholder + Preview */}
        <div className="mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <div className="w-24 h-24 bg-gray-800 flex justify-center items-center rounded-lg mb-2 hover:bg-gray-700 transition">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full rounded-lg" />
              ) : (
                <img src={imageIcon} alt="Upload" className="w-10 h-10 opacity-70" />
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
              disabled={isUploading || isPosting}
            />
            <span className="ml-3 text-sm text-gray-400">Add an image (optional)</span>
          </label>

          {imagePreview && (
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => {
                  // remove selected image
                  setImageFile(null);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }}
                className="text-sm px-3 py-1 bg-gray-700 rounded text-white"
                disabled={isUploading || isPosting}
              >
                Remove
              </button>
              {isUploading && <span className="text-sm text-gray-300">Uploading image...</span>}
            </div>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white text-lg mb-4 pb-1"
          disabled={isUploading || isPosting}
        />

        {/* Context Label */}
        <p className="text-gray-400 text-sm mb-2">Context</p>

        {/* Body Text Area */}
        <textarea
          placeholder="Body Text.... (required)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-48 bg-transparent border border-gray-600 rounded-lg p-3 text-gray-200 resize-none focus:outline-none focus:border-white mb-6"
          disabled={isUploading || isPosting}
        />

        {/* Post Button */}
        <button
          onClick={handlePost}
          className={`w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-300 transition ${isPosting || isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={isPosting || isUploading}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export default PostBlogPage;
