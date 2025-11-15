import React, { useState, useEffect } from 'react';
import { getPendingApplications, approveApplication, rejectApplication } from '../../api/chefApproval';
import ApplicationDetails from './ApplicationDetailsPage';
import { Eye, Search } from 'lucide-react';

function ChefApprovalPage() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Approve Dialog
  const [approveId, setApproveId] = useState(null);
  const [approving, setApproving] = useState(false);

  // Reject Dialog
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app =>
        app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // --- APPROVE ---
  const openApproveDialog = (id) => {
    setApproveId(id);
  };

  const performApprove = async () => {
    try {
      setApproving(true);
      await approveApplication(approveId);
      setApplications((prev) => prev.filter((a) => a.Id !== approveId));
      setApproveId(null);
      alert('Approved!');
    } catch (err) {
      alert(err.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  // --- REJECT ---
  const openRejectDialog = (id) => {
    setRejectId(id);
    setRejectReason('');
  };

  const performReject = async () => {
    if (!rejectReason.trim()) {
      alert('Reason is required');
      return;
    }
    try {
      setRejecting(true);
      await rejectApplication(rejectId, rejectReason);
      setApplications((prev) => prev.filter((a) => a.Id !== rejectId));
      setRejectId(null);
      alert('Rejected!');
    } catch (err) {
      alert(err.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  const handleViewDetails = (id) => setSelectedApplicationId(id);
  const handleBackToList = () => {
    setSelectedApplicationId(null);
    loadApplications();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (selectedApplicationId) {
    return (
      <ApplicationDetails
        applicationId={selectedApplicationId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) return <LoadingState title="Chef Approval" />;
  if (error) return <ErrorState title="Chef Approval" error={error} onRetry={loadApplications} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Chef Approval</h2>
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          {searchTerm ? (
            <div>
              <p className="text-gray-400 mb-2">No applications found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-500 hover:text-orange-400 transition"
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-gray-400">No pending applications</p>
          )}
        </div>
      ) : (
        <Table
          applications={filteredApplications}
          onView={handleViewDetails}
          onApprove={openApproveDialog}
          onReject={openRejectDialog}
          searchTerm={searchTerm}
        />
      )}

      {/* ---------- APPROVE DIALOG ---------- */}
      {approveId !== null && (
        <Modal onClose={() => setApproveId(null)}>
          <h3 className="text-xl font-bold mb-4">Approve Application</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to approve this chef application?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setApproveId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performApprove}
              disabled={approving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
            >
              {approving ? 'Approving…' : 'Yes, Approve'}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- REJECT DIALOG ---------- */}
      {rejectId !== null && (
        <Modal onClose={() => setRejectId(null)}>
          <h3 className="text-xl font-bold mb-4">Reject Application</h3>
          <p className="text-gray-400 mb-4">
            Provide a reason (visible to the chef).
          </p>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition"
          />
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setRejectId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performReject}
              disabled={rejecting || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {rejecting ? 'Submitting…' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState({ title }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-gray-400">Loading applications…</p>
      </div>
    </div>
  );
}

function ErrorState({ title, error, onRetry }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
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

function Table({ applications, onView, onApprove, onReject, searchTerm }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {searchTerm && (
        <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <p className="text-sm text-gray-400">
            Showing {applications.length} result{applications.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>
        </div>
      )}
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="text-left p-4 font-semibold">Name</th>
            <th className="text-left p-4 font-semibold">Email</th>
            <th className="text-left p-4 font-semibold">Experience</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
              <td className="p-4 font-medium">{app.fullName}</td>
              <td className="p-4 text-gray-400">{app.email}</td>
              <td className="p-4 text-gray-400">{app.yearsOfExperience} years</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-500 rounded-full text-sm">
                  {app.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onView(app.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition inline-flex items-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => onApprove(app.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(app.Id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Reject
                  </button>
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

export default ChefApprovalPage;