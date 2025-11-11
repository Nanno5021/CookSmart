import React, { useState } from 'react';

function ChefApprovalPage() {
  const [applications] = useState([
    { id: 1, name: 'Mike Johnson', email: 'mike@example.com', experience: '5 years', status: 'pending' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', experience: '3 years', status: 'pending' },
  ]);

  const handleApprove = (id) => {
    alert(`Approved application ${id}`);
  };

  const handleReject = (id) => {
    alert(`Rejected application ${id}`);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Chef Approval</h2>
      
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Email</th>
              <th className="text-left p-4 font-semibold">Experience</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-zinc-800">
                <td className="p-4">{app.name}</td>
                <td className="p-4 text-gray-400">{app.email}</td>
                <td className="p-4 text-gray-400">{app.experience}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-500 rounded-full text-sm">
                    {app.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Reject
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

export default ChefApprovalPage;