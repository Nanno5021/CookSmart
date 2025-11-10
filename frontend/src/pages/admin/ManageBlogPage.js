import React, { useState } from 'react';

function ManageBlogPage() {
  const [blogs] = useState([
    { id: 1, title: 'Best Pasta Recipes', author: 'chef_mike', date: '2024-01-15', status: 'published' },
    { id: 2, title: 'Healthy Breakfast Ideas', author: 'foodie_lover', date: '2024-01-14', status: 'published' },
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      alert(`Deleted blog ${id}`);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Blogs</h2>
      
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4 font-semibold">Title</th>
              <th className="text-left p-4 font-semibold">Author</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-t border-zinc-800">
                <td className="p-4">{blog.title}</td>
                <td className="p-4 text-gray-400">{blog.author}</td>
                <td className="p-4 text-gray-400">{blog.date}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-500 rounded-full text-sm">
                    {blog.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default ManageBlogPage;