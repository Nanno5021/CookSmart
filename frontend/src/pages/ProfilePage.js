import React, { useEffect, useState } from "react";
import { fetchMyProfile } from "../api/profileapi";
import { apiFetch } from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Threads");
  const [newPost, setNewPost] = useState("");
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      console.log("Loading profile... Token exists:", !!token);

      // show cached login user instantly if present (login stores "user")
      try {
        const cached = localStorage.getItem("user");
        if (cached) {
          const u = JSON.parse(cached);
          console.log("Loaded cached user:", u);
          setUserData({
            fullName: u.fullName || "Unknown",
            username: u.username || "unknown",
            profilePic: u.profilePic || picture,
          });
        }
      } catch (e) {
        console.warn("Failed to parse cached user:", e);
      }

      // if no token, skip server fetch
      if (!token) {
        console.log("No token found, skipping server fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile from server...");
        // fetchProfile() is from ../api/profileapi and uses apiClient internally
        const data = await fetchMyProfile();
        console.log("Profile data received:", data);

        if (!data) {
          setError("No profile data returned from server.");
          setLoading(false);
          return;
        }

        // map returned server data to UI model
        setUserData({
          fullName: data.fullName || "Unknown",
          username: data.username || "unknown",
          profilePic: data.avatarUrl || picture,
        });

        const mappedPosts = (data.posts || []).map((p) => ({
          id: p.id,
          username: data.username || "unknown",
          content: p.content ?? p.title ?? "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          rating: typeof p.rating === "number" ? p.rating : 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
        }));

        setPosts(mappedPosts);
        console.log("Profile loaded successfully");
      } catch (err) {
        console.error("Error fetching profile:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack
        });
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  const handleNewPost = () => {
    if (!isLoggedIn) {
      alert("You need to log in to create a post.");
      return;
    }
    navigate("/postblog", { state: { title: newPost } });
  };

  // Use apiFetch directly for post actions
  const handleRate = async (id) => {
    if (!isLoggedIn) {
      alert("You need to log in to rate posts.");
      return;
    }

    try {
      // POST to /posts/:id/rate (apiFetch will add base and auth headers)
      await apiFetch(`/posts/${id}/rate`, {
        method: "POST",
      });

      // Optimistic UI: increment rating locally
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, rating: (p.rating || 0) + 1 } : p))
      );
    } catch (err) {
      console.error("Failed to rate post:", err);
      alert("Failed to rate post. Please try again.");
    }
  };

  const handleComment = (id) => {
    navigate(`/posts/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-gray-400">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="max-w-md text-center">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <p className="text-gray-400 text-sm mb-4">
            Check the browser console for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayUser = userData || {
    fullName: "Unknown",
    username: "unknown",
    profilePic: picture,
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center">
      <Navbar />

      <div
        className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{displayUser.fullName}</h1>
              <p className="text-gray-400 mb-3">@{displayUser.username}</p>
            </div>
            <img
              src={displayUser.profilePic}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <button
            onClick={() => navigate("/editprofile")}
            className="w-full bg-transparent border border-gray-600 rounded-lg py-2 text-white hover:bg-gray-800 transition"
          >
            Edit profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("Threads")}
            className={`flex-1 py-3 text-center font-semibold transition ${
              activeTab === "Threads"
                ? "text-white border-b-2 border-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Threads
          </button>
          <button
            onClick={() => setActiveTab("Replies")}
            className={`flex-1 py-3 text-center font-semibold transition ${
              activeTab === "Replies"
                ? "text-white border-b-2 border-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Replies
          </button>
        </div>

        {/* Post Input Area */}
        {activeTab === "Threads" && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={displayUser.profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="What's new?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-500"
              />
              <button
                onClick={handleNewPost}
                className="text-white font-semibold px-4 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-900 transition"
              >
                Post
              </button>
            </div>
            <hr className="border-gray-800 mb-6" />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {activeTab === "Threads" ? (
            posts.length > 0 ? (
              posts.map((post, index) => (
                <React.Fragment key={post.id || index}>
                  <div className="pb-6">
                    <div className="flex items-start space-x-3">
                      <img
                        src={displayUser.profilePic}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-white">
                            {post.username || displayUser.username}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <p className="text-gray-200 mb-4">{post.content}</p>

                        <div className="flex items-center space-x-6 text-gray-400 text-sm">
                          <button
                            onClick={() => handleRate(post.id)}
                            disabled={!isLoggedIn}
                            className={`flex items-center space-x-1 transition ${
                              isLoggedIn ? "hover:text-white" : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <img src={ratingIcon} alt="Rating" className="w-5 h-5 invert" />
                            <span>{post.rating}</span>
                          </button>

                          <button
                            onClick={() => handleComment(post.id)}
                            className="flex items-center space-x-1 hover:text-white transition"
                          >
                            <img src={commentIcon} alt="Comment" className="w-5 h-5 invert" />
                            <span>{post.comments}</span>
                          </button>

                          <div className="flex items-center space-x-1">
                            <img src={viewsIcon} alt="Views" className="w-5 h-5 invert" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < posts.length - 1 && <hr className="border-gray-800" />}
                </React.Fragment>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10">No posts yet. Share something!</p>
            )
          ) : (
            <p className="text-center text-gray-500 mt-10">No replies yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;