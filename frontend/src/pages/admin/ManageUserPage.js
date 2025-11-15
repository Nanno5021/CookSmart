import React, { useState, useEffect } from 'react';
import { fetchAllUsers, banUser, unbanUser, updateUserRole, createChefProfile, deleteChefProfile, createUser } from '../../api/manageUserApi';
import UserDetailsPage from './UserDetailsPage';
import { Eye, Search, UserPlus } from 'lucide-react';
import EditUserPage from "./EditUserPage";
import ChefApplicationForm from "./ChefApplicationForm"; 
import EditChefProfile from "./EditChefProfile";
import CreateUserPage from "./CreateUserPage";

function ManageUserPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingChefUserId, setEditingChefUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // NEW: Create User State
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // Chef Application Form State
  const [showChefForm, setShowChefForm] = useState(false);
  const [chefFormUser, setChefFormUser] = useState(null);

  // Edit Role Dialog
  const [editRoleUserId, setEditRoleUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Ban Dialog
  const [banUserId, setBanUserId] = useState(null);
  const [banning, setBanning] = useState(false);

  // Unban Dialog
  const [unbanUserId, setUnbanUserId] = useState(null);
  const [unbanning, setUnbanning] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle user creation
  const handleCreateUser = async (userData) => {
    try {
      const newUser = await createUser(userData);
      
      // If the role is Chef, show the chef application form
      if (userData.role === 'Chef') {
        setChefFormUser(newUser);
        setShowChefForm(true);
        setShowCreateUser(false);
        alert('User created successfully! Please complete the chef profile.');
      } else {
        // For non-chef users, just refresh and go back
        await loadUsers();
        setShowCreateUser(false);
        alert('User created successfully!');
      }
    } catch (err) {
      throw err; // Let CreateUserPage handle the error
    }
  };

  // --- EDIT ROLE ---
  const openEditRoleDialog = (user) => {
    setEditRoleUserId(user.id);
    setSelectedRole(user.role);
  };

  const performRoleUpdate = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      setUpdatingRole(true);
      
      const user = users.find(u => u.id === editRoleUserId);
      
      if (user.role === 'Chef' && selectedRole !== 'Chef') {
        if (!window.confirm('Changing from Chef role will delete all chef profile data. Are you sure?')) {
          setUpdatingRole(false);
          return;
        }
        
        await deleteChefProfile(editRoleUserId);
        await updateUserRole(editRoleUserId, selectedRole);
        
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editRoleUserId ? { ...u, role: selectedRole } : u
          )
        );
        
        setEditRoleUserId(null);
        alert('Chef profile deleted and role updated successfully!');
      }
      else if (selectedRole === 'Chef' && user.role !== 'Chef') {
        await updateUserRole(editRoleUserId, selectedRole);
        
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editRoleUserId ? { ...u, role: selectedRole } : u
          )
        );
        
        setEditRoleUserId(null);
        setChefFormUser(user);
        setShowChefForm(true);
        
        alert('Role updated! Please complete the chef profile.');
      } else {
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

  const handleChefProfileSubmit = async (chefData) => {
    try {
      await createChefProfile(chefFormUser.id, chefData);
      setShowChefForm(false);
      setChefFormUser(null);
      await loadUsers();
    } catch (err) {
      throw err;
    }
  };

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

  // --- UNBAN USER ---
  const openUnbanDialog = (id) => {
    setUnbanUserId(id);
  };

  const performUnban = async () => {
    try {
      setUnbanning(true);
      await unbanUser(unbanUserId);
      setUsers((prev) =>
        prev.map((u) => (u.id === unbanUserId ? { ...u, isBanned: false } : u))
      );
      setUnbanUserId(null);
      alert('User unbanned successfully!');
    } catch (err) {
      alert(err.message || 'Failed to unban user');
    } finally {
      setUnbanning(false);
    }
  };

  // --- VIEW DETAILS ---
  const handleViewDetails = (id) => setSelectedUserId(id);
  
  // --- EDIT USER ---
  const handleEditUser = (userId, editType = 'user') => {
    if (editType === 'chef') {
      setEditingChefUserId(userId);
    } else {
      setEditingUserId(userId);
    }
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    setEditingUserId(null);
    setEditingChefUserId(null);
    setShowCreateUser(false);
    loadUsers();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show Create User Page
  if (showCreateUser) {
    return (
      <CreateUserPage
        onBack={handleBackToList}
        onUserCreated={handleCreateUser}
      />
    );
  }

  // Show Chef Application Form
  if (showChefForm && chefFormUser) {
    return (
      <ChefApplicationForm
        user={chefFormUser}
        onBack={handleChefFormCancel}
        onSubmit={handleChefProfileSubmit}
      />
    );
  }

  // Show edit chef profile page
  if (editingChefUserId) {
    return (
      <EditChefProfile
        userId={editingChefUserId}
        onBack={handleBackToList}
        onSave={loadUsers}
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
          onEdit={handleEditUser}
        />
      );
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadUsers} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Manage Users</h2>
        <div className="flex items-center space-x-4">
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, role, or username..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          <button
            onClick={() => setShowCreateUser(true)}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition inline-flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          {searchTerm ? (
            <div>
              <p className="text-gray-400 mb-2">No users found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-500 hover:text-orange-400 transition"
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-gray-400">No users found</p>
          )}
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          onViewDetails={handleViewDetails}
          onEditRole={openEditRoleDialog}
          onBan={openBanDialog}
          onUnban={openUnbanDialog}  
          onEditUser={setEditingUserId}
          searchTerm={searchTerm}
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

      {/* ---------- UNBAN DIALOG ---------- */}
      {unbanUserId !== null && (
        <Modal onClose={() => setUnbanUserId(null)}>
          <h3 className="text-xl font-bold mb-4">Unban User</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to unban this user? They will be able to
            access the platform again.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setUnbanUserId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performUnban}
              disabled={unbanning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
            >
              {unbanning ? 'Unbanning…' : 'Yes, Unban User'}
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

function UsersTable({ users, onViewDetails, onEditRole, onBan, onUnban, onEditUser, searchTerm }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {searchTerm && (
        <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <p className="text-sm text-gray-400">
            Showing {users.length} user{users.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>
        </div>
      )}
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
            <tr key={user.id} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
              <td className="p-4 font-medium">{user.fullName}</td>
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
              <td className="p-4">
                <div className="flex justify-center space-x-2">
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

                  {user.isBanned ? (
                    <button
                      onClick={() => onUnban(user.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => onBan(user.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    >
                      Ban
                    </button>
                  )}
                </div>
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