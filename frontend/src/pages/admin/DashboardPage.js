function DashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,234', color: 'bg-blue-500' },
    { label: 'Pending Chef Approvals', value: '12', color: 'bg-orange-500' },
    { label: 'Total Blogs', value: '456', color: 'bg-green-500' },
    { label: 'Total Recipes', value: '789', color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            action="New user registered"
            user="john_doe@example.com"
            time="2 minutes ago"
          />
          <ActivityItem
            action="Chef application submitted"
            user="chef_mike"
            time="15 minutes ago"
          />
          <ActivityItem
            action="New blog post created"
            user="foodie_lover"
            time="1 hour ago"
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ action, user, time }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
      <div>
        <p className="text-white font-medium">{action}</p>
        <p className="text-gray-400 text-sm">{user}</p>
      </div>
      <p className="text-gray-500 text-sm">{time}</p>
    </div>
  );
}

export default DashboardPage;