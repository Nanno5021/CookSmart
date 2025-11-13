import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Star, MessageCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { fetchBlogById, deleteBlogComment } from '../../api/manageBlogApi';

function BlogDetailsPage({ blogId, onBack, onEdit }) {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);

  useEffect(() => {
    loadBlogDetails();
  }, [blogId]);

  const loadBlogDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogById(blogId);
      setBlog(data);
      setComments(data.commentsList || []);
    } catch (err) {
      setError(err.message || 'Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingComment(true);
      await deleteBlogComment(blogId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setBlog((prev) => ({ ...prev, comments: prev.comments - 1 }));
      setDeleteCommentId(null);
      alert('Comment deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    } finally {
      setDeletingComment(false);
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
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>
        
        <button
          onClick={() => onEdit(blogId)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2"
        >
          <Edit size={18} />
          <span>Edit Post</span>
        </button>
      </div>

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
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-4">Content</h3>
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {blog.content}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
          <MessageCircle size={24} />
          <span>Comments ({comments.length})</span>
        </h3>

        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* User Avatar */}
                    {comment.userAvatarUrl ? (
                      <img
                        src={`${comment.userAvatarUrl}`}
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}

                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-white">
                          {comment.userName}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Star size={14} />
                          <span>{comment.likes} likes</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteCommentId(comment.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition inline-flex items-center space-x-1 text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Comment Confirmation Dialog */}
      {deleteCommentId !== null && (
        <Modal onClose={() => setDeleteCommentId(null)}>
          <h3 className="text-xl font-bold mb-4">Delete Comment</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteCommentId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteComment(deleteCommentId)}
              disabled={deletingComment}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {deletingComment ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full p-6">
        {children}
      </div>
    </div>
  );
}

export default BlogDetailsPage;