import React, { useState, useEffect } from 'react';
import {fetchAllUsers, banUser, updateUserRole } from '../../api/manageUserApi';


function ManageUserPage() {
    const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  const handleBan = async (id) => {
    if (!window.confirm("Are you sure you want to ban this user?")) return;
    await banUser(id);
    setUsers(users.map(u => u.id === id ? { ...u, isBanned: true } : u));
  };

  const handleEditRole = async (id) => {
    const newRole = prompt("Enter new role (User / Chef / Admin):");
    if (!newRole) return;
    await updateUserRole(id, newRole);
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Users</h2>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Join Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-zinc-800">
                <td className="p-4">{user.fullName}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4 text-gray-400">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {user.isBanned 
                    ? <span className="text-red-400">BANNED</span>
                    : <span className="text-green-400">Active</span>}
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleEditRole(user.id)} className="px-4 py-2 bg-yellow-500 rounded-lg">Edit Role</button>
                  <button onClick={() => handleBan(user.id)} className="px-4 py-2 bg-red-500 rounded-lg">Ban</button>
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
