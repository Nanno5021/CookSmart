function DashboardPage() {
  const modules = [
    { 
      name: 'User Management', 
      description: 'Manage user accounts, roles, and access permissions',
      path: 'manage-user'
    },
    { 
      name: 'Chef Approvals', 
      description: 'Review and process chef applications',
      path: 'chef-approval'
    },
    { 
      name: 'Recipe Management', 
      description: 'Oversee recipe submissions and content',
      path: 'manage-recipe'
    },
    { 
      name: 'Blog Management', 
      description: 'Manage blog posts and editorial content',
      path: 'manage-blog'
    },
    { 
      name: 'Course Management', 
      description: 'Administer cooking courses and curriculum',
      path: 'manage-course'
    },
    { 
      name: 'Site Preview', 
      description: 'View the live site as visitors see it',
      path: 'preview-site'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-3">Admin Dashboard</h1>
        <div className="flex items-center text-gray-400 mb-2">
          <span className="text-sm">Welcome back</span>
        </div>
        <p className="text-gray-300 max-w-2xl">
          This dashboard provides access to all administrative functions for the CookSmart platform. 
          Select a module from the sidebar to begin managing specific areas.
        </p>
      </div>

      {/* Management Modules */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Management Modules</h2>
          <p className="text-gray-400 text-sm mt-1">
            Access different areas of platform administration
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <div 
                key={index} 
                className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer"
                onClick={() => window.location.hash = module.path}
              >
                <h3 className="font-medium text-white mb-2">{module.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-500 bg-opacity-5 border border-blue-500 border-opacity-20 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-3">Getting Started</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Navigate using the sidebar menu to access different management sections</p>
          <p>• Review pending chef applications regularly to maintain platform quality</p>
          <p>• Use the site preview to verify changes before they go live</p>
          <p>• Contact technical support for any system-related issues</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;