import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";
import postIcon from "../assets/post.png";
import { fetchPosts } from "../api/post";
import { apiFetch } from "../api/apiClient";
import { fetchMyProfile, fetchProfileByUsername } from "../api/profileapi";

/* Helper: convert relative -> absolute and accept many field names */
function resolveAvatarUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

function pickAvatarFromPost(post) {
  const candidates = [
    post.avatarUrl,
    post.avatar,
    post.profilePic,
    post.image,
    post.userAvatar,
    post.authorAvatar,
    post.author?.avatarUrl,
    post.user?.avatarUrl,
  ];
  const first = candidates.flat?.().find(Boolean) ?? candidates.find(Boolean);
  return first ? resolveAvatarUrl(first) : null;
}

function pickAvatarFromProfile(data) {
  const candidates = [
    data.avatarUrl,
    data.avatar,
    data.profilePic,
    data.picture,
    data.imageUrl,
    data.avatar_url,
  ];
  const first = candidates.find(Boolean);
  return first ? resolveAvatarUrl(first) : null;
}

function Avatar({ src, name, size = 40 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className={`rounded-full object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  // fallback: initials circle
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div
      title={name || "User"}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        backgroundColor: "#2a2a2a",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
}

export default function MainPage() {
  const [sortOption, setSortOption] = useState("Popular");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null); // current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // load current user (for small avatar & username)
        try {
          const profile = await fetchMyProfile();
          if (!mounted) return;
          setMe({
            username: profile.username ?? profile.fullName ?? "You",
            fullName: profile.fullName ?? profile.username ?? "You",
            avatar: pickAvatarFromProfile(profile),
          });
        } catch (err) {
          // quietly ignore; me can be null (anonymous)
          console.warn("Failed to load current profile:", err);
          if (mounted) setMe(null);
        }

        // load posts
        const data = await fetchPosts();
        const arr = Array.isArray(data) ? data : data?.posts ?? [];
        if (!mounted) return;

        // compute username for each post using various fields, keep original post object
        const postsWithUsernames = arr.map(p => ({
          raw: p,
          id: p.id,
          username: p.username ?? p.author?.username ?? p.user?.username ?? p.user?.email ?? "Anonymous",
          content: p.content ?? p.title ?? "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          rating: typeof p.rating === "number" ? p.rating : 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
          avatarFromPost: pickAvatarFromPost(p),
        }));

        // gather unique usernames to fetch public profiles
        const usernameSet = new Set(
          postsWithUsernames.map(p => p.username).filter(Boolean).slice(0, 200) // defensive: limit
        );

        const usernameList = Array.from(usernameSet).filter(u => u && u !== "Anonymous");

        // Fetch profiles in parallel, but map results to username -> profile (graceful fail)
        const profileMap = {};

        await Promise.all(
          usernameList.map(async (uname) => {
            try {
              const prof = await fetchProfileByUsername(uname);
              profileMap[uname] = prof;
            } catch (err) {
              // ignore failures for individual username
              profileMap[uname] = null;
            }
          })
        );

        // map to UI posts
        const mapped = arr.map((p) => ({
          id: p.id,
          username: p.username || "Anonymous",
          content: p.content ?? p.title ?? "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          rating: p.rating ?? 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
          avatar: p.avatarUrl || null,
        }));

        if (!mounted) return;
        setPosts(mapped);
      } catch (err) {
        console.error("Error loading main feed:", err);
        if (mounted) setError(err.message || "Failed to load posts");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleNewPost = () => {
    if (!isLoggedIn) {
      alert("You need to log in to create a post.");
      return;
    }
    navigate("/postblog", { state: { title: newPost } });
  };

  const handleRate = async (id) => {
    if (!isLoggedIn) {
      alert("You need to log in to rate posts.");
      return;
    }

    // optimistic
    setPosts(prev => prev.map(p => p.id === id ? { ...p, rating: (p.rating || 0) + 1 } : p));

    try {
      await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    } catch (err) {
      console.error("Failed to rate post:", err);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, rating: Math.max((p.rating || 1) - 1, 0) } : p));
      alert("Failed to rate post. Please try again.");
    }
  };

  const handleComment = (id) => navigate(`/posts/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center relative">
        <Navbar />
        <div className="text-gray-400">Loading posts…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#181818" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Main Feed</h2>
          <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none">
            <option value="Popular">Popular</option>
            <option value="Recent">Recent</option>
          </select>
        </div>

        {/* New Post Input */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 w-full">
            {/* show current user's avatar if available, otherwise initials */}
            <div>
              <Avatar src={me?.avatar} name={me?.fullName || me?.username} size={48} />
            </div>

            <input
              type="text"
              placeholder={isLoggedIn ? `What's on your mind, ${me?.username ?? "you"}?` : "New Blog Post?"}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-transparent border-b border-gray-600 text-gray-300 focus:outline-none focus:border-white pb-1"
            />
          </div>

          <button onClick={handleNewPost} className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition ml-4">
            Post
          </button>
        </div>

        <hr className="border-gray-700 mb-6" />

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <div className="w-full p-6 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Avatar src={post.avatar} name={post.username} size={40} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-white">{post.username}</h3>
                      <p className="text-sm text-gray-400">{post.createdAt.toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-gray-200 mb-4">{post.content}</p>

                  {post.imageUrl && (
                    <div className="mt-3 mb-4">
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="rounded-xl max-h-96 w-full object-cover border border-gray-700"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex space-x-6 items-center">
                      <button onClick={() => handleRate(post.id)} disabled={!isLoggedIn} className={`flex items-center space-x-1 transition ${isLoggedIn ? "hover:text-white" : "opacity-50 cursor-not-allowed"}`}>
                        <img src={ratingIcon} alt="Rating" className="w-5 h-5 invert" />
                        <span>{post.rating || 0}</span>
                      </button>

                      <button onClick={() => handleComment(post.id)} className="flex items-center space-x-1 hover:text-white transition">
                        <img src={commentIcon} alt="Comment" className="w-5 h-5 invert" />
                        <span>{post.comments || 0}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <img src={viewsIcon} alt="Views" className="w-5 h-5 invert" />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {index < posts.length - 1 && (
                  <hr className="border-t" style={{ borderColor: "#2a2a2a", marginTop: "2rem", marginBottom: "2rem" }} />
                )}
              </React.Fragment>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">No blog posts available yet.</p>
          )}
        </div>
      </div>

      <button onClick={() => (isLoggedIn ? navigate("/postblog") : alert("You need to log in to create a post."))} className="fixed bottom-10 right-10 bg-white rounded-full p-4 shadow-lg hover:scale-105 transition" title="New Post">
        <img src={postIcon} alt="Post" className="w-8 h-8" />
      </button>
    </div>
  );
}
