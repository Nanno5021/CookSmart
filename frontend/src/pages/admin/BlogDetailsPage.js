import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Star, MessageCircle, Eye } from 'lucide-react';
import { fetchBlogById } from '../../api/manageBlogApi';

function BlogDetailsPage({ blogId, onBack }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlogDetails();
  }, [blogId]);

  const loadBlogDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogById(blogId);
      setBlog(data);
    } catch (err) {
      setError(err.message || 'Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading blog details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadBlogDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Blog post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Blogs</span>
      </button>

      {/* Blog Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        
        {/* Meta Information */}
        <div className="flex items-center space-x-6 text-gray-400 mb-6">
          <div className="flex items-center space-x-2">
            <User size={18} />
            <span>{blog.authorName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={18} />
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Star size={18} />
            <span>{blog.rating} ratings</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <MessageCircle size={18} />
            <span>{blog.comments} comments</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <Eye size={18} />
            <span>{blog.views} views</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.imageUrl && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <h3 className="text-xl font-bold mb-4">Content</h3>
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {blog.content}
        </div>
      </div>
    </div>
  );
}

export default BlogDetailsPage;