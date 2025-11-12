import React, { useState, useEffect } from 'react';
import { fetchAllUsers, banUser, updateUserRole, createChefProfile } from '../../api/manageUserApi';
import UserDetailsPage from './UserDetailsPage';
import { Eye } from 'lucide-react';
import EditUserPage from "./EditUserPage";
import ChefApplicationForm from "./ChefApplicationForm"; 

function ManageUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // NEW: Chef Application Form State
  const [showChefForm, setShowChefForm] = useState(false);
  const [chefFormUser, setChefFormUser] = useState(null);

  // Edit Role Dialog
  const [editRoleUserId, setEditRoleUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Ban Dialog
  const [banUserId, setBanUserId] = useState(null);
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT ROLE ---
  const openEditRoleDialog = (user) => {
    setEditRoleUserId(user.id);
    setSelectedRole(user.role);
  };

  // UPDATED: Handle role update - check if changing to Chef
  const performRoleUpdate = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      setUpdatingRole(true);
      
      // Find the user being updated
      const user = users.find(u => u.id === editRoleUserId);
      
      // Check if changing TO Chef role
      if (selectedRole === 'Chef' && user.role !== 'Chef') {
        // Update the role first
        await updateUserRole(editRoleUserId, selectedRole);
        
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editRoleUserId ? { ...u, role: selectedRole } : u
          )
        );
        
        // Close the role dialog
        setEditRoleUserId(null);
        
        // Show chef application form
        setChefFormUser(user);
        setShowChefForm(true);
        
        alert('Role updated! Please complete the chef profile.');
      } else {
        // Normal role update (not changing to Chef)
        await updateUserRole(editRoleUserId, selectedRole);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editRoleUserId ? { ...u, role: selectedRole } : u
          )
        );
        setEditRoleUserId(null);
        alert('Role updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  // NEW: Handle chef profile submission
  const handleChefProfileSubmit = async (chefData) => {
    try {
      await createChefProfile(chefFormUser.id, chefData);
      setShowChefForm(false);
      setChefFormUser(null);
      await loadUsers(); // Refresh the list
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  // NEW: Handle chef form cancellation
  const handleChefFormCancel = () => {
    setShowChefForm(false);
    setChefFormUser(null);
  };

  // --- BAN USER ---
  const openBanDialog = (id) => {
    setBanUserId(id);
  };

  const performBan = async () => {
    try {
      setBanning(true);
      await banUser(banUserId);
      setUsers((prev) =>
        prev.map((u) => (u.id === banUserId ? { ...u, isBanned: true } : u))
      );
      setBanUserId(null);
      alert('User banned successfully!');
    } catch (err) {
      alert(err.message || 'Failed to ban user');
    } finally {
      setBanning(false);
    }
  };

  // --- VIEW DETAILS ---
  const handleViewDetails = (id) => setSelectedUserId(id);
  const handleBackToList = () => {
    setSelectedUserId(null);
    setEditingUserId(null);
    loadUsers();
  };

  // NEW: Show Chef Application Form if needed
  if (showChefForm && chefFormUser) {
    return (
      <ChefApplicationForm
        user={chefFormUser}
        onBack={handleChefFormCancel}
        onSubmit={handleChefProfileSubmit}
      />
    );
  }

  // Show edit or details page
  if (selectedUserId || editingUserId) {
    if (editingUserId) {
      return <EditUserPage userId={editingUserId} onBack={handleBackToList} onSave={loadUsers} />;
    }
    if (selectedUserId) {
      return (
        <UserDetailsPage
          userId={selectedUserId}
          onBack={handleBackToList}
          onEdit={setEditingUserId}
        />
      );
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadUsers} />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Users</h2>

      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <UsersTable
          users={users}
          onViewDetails={handleViewDetails}
          onEditRole={openEditRoleDialog}
          onBan={openBanDialog}
          onEditUser={setEditingUserId}
        />
      )}

      {/* ---------- EDIT ROLE DIALOG ---------- */}
      {editRoleUserId !== null && (
        <Modal onClose={() => setEditRoleUserId(null)}>
          <h3 className="text-xl font-bold mb-4">Edit User Role</h3>
          <p className="text-gray-400 mb-4">Select a new role for this user:</p>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition mb-6"
          >
            <option value="">-- Select Role --</option>
            <option value="User">User</option>
            <option value="Chef">Chef</option>
            <option value="Admin">Admin</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditRoleUserId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performRoleUpdate}
              disabled={updatingRole || !selectedRole}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50"
            >
              {updatingRole ? 'Updating…' : 'Update Role'}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- BAN DIALOG ---------- */}
      {banUserId !== null && (
        <Modal onClose={() => setBanUserId(null)}>
          <h3 className="text-xl font-bold mb-4">Ban User</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to ban this user? They will no longer be able
            to access the platform.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setBanUserId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performBan}
              disabled={banning}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {banning ? 'Banning…' : 'Yes, Ban User'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Users</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-gray-400">Loading users…</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Users</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
      <p className="text-gray-400">No users found</p>
    </div>
  );
}

function UsersTable({ users, onViewDetails, onEditRole, onBan , onEditUser }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="text-left p-4 font-semibold">Name</th>
            <th className="text-left p-4 font-semibold">Email</th>
            <th className="text-left p-4 font-semibold">Role</th>
            <th className="text-left p-4 font-semibold">Join Date</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-zinc-800">
              <td className="p-4">{user.fullName}</td>
              <td className="p-4 text-gray-400">{user.email}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'Admin'
                      ? 'bg-purple-500 bg-opacity-20 text-purple-400'
                      : user.role === 'Chef'
                      ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                      : 'bg-blue-500 bg-opacity-20 text-blue-400'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-gray-400">
                {new Date(user.joinDate).toLocaleDateString()}
              </td>
              <td className="p-4">
                {user.isBanned ? (
                  <span className="px-3 py-1 bg-red-500 bg-opacity-20 text-red-400 rounded-full text-sm">
                    Banned
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm">
                    Active
                  </span>
                )}
              </td>
              <td className="p-4 space-x-2">
                <button
                  onClick={() => onViewDetails(user.id)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition inline-flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>

                <button
                  onClick={() => onEditUser(user.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => onEditRole(user)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                  disabled={user.isBanned}
                >
                  Edit Role
                </button>

                <button
                  onClick={() => onBan(user.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  disabled={user.isBanned}
                >
                  {user.isBanned ? 'Banned' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default ManageUserPage;