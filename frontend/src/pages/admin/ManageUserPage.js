import React, { useState } from 'react';

function ManageUserPage() {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', joinDate: '2024-01-10' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Chef', joinDate: '2024-01-12' },
  ]);

  const handleBan = (id) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      alert(`Banned user ${id}`);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Users</h2>
      
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Email</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Join Date</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-800">
                <td className="p-4">{user.name}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'Chef' 
                      ? 'bg-orange-500 bg-opacity-20 text-orange-500'
                      : 'bg-blue-500 bg-opacity-20 text-blue-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{user.joinDate}</td>
                <td className="p-4 space-x-2">
                  <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition">
                    Edit Role
                  </button>
                  <button
                    onClick={() => handleBan(user.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Ban
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

export default ManageUserPage;