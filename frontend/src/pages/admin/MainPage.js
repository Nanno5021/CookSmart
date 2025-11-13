import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  ChefHat,
  FileText,
  Award,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import DashboardPage from "./DashboardPage";
import ChefApprovalPage from "./ChefApprovalPage";
import ManageBlogPage from "./ManageBlogPage";
import ManageRecipePage from "./ManageRecipePage";
import ManageUserPage from "./ManageUserPage";
import ManageCoursePage from "./ManageCoursePage";
import { logoutUser } from "../../api/auth";

// Import the logo
import logo from "../../assets/logo.png";

function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate(); 

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutUser();
    }
  };

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "chef-approval", name: "Chef Approval", icon: ChefHat },
    { id: "manage-blog", name: "Manage Blogs", icon: FileText },
    { id: "manage-recipe", name: "Manage Recipes", icon: BookOpen },
    { id: "manage-user", name: "Manage Users", icon: Users },
    { id: "manage-course", name: "Manage Courses", icon: Award },
    { id: "preview-site", name: "Preview Site", icon: Globe },
  ];

  const handleMenuClick = (id) => {
    if (id === "preview-site") {
      navigate("/"); 
      return;
    }
    setActiveModule(id);
  };

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardPage />;
      case "chef-approval":
        return <ChefApprovalPage />;
      case "manage-blog":
        return <ManageBlogPage />;
      case "manage-recipe":
        return <ManageRecipePage />;
      case "manage-user":
        return <ManageUserPage />;
      case "manage-course":
        return <ManageCoursePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-zinc-900 transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="CookSmart Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                CookSmart Admin
              </h1>
            </div>
          )}
          {!sidebarOpen && (
            <div className="flex justify-center w-full">
              <img 
                src={logo} 
                alt="CookSmart Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center ${
                  sidebarOpen ? "justify-start" : "justify-center"
                } space-x-3 px-4 py-3 rounded-lg transition ${
                  activeModule === item.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              sidebarOpen ? "justify-start" : "justify-center"
            } space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default AdminDashboard;

