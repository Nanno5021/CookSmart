import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { Home, BookOpen, Bell, GraduationCap, User, LogOut, LogIn } from "lucide-react";
import { logoutUser } from "../api/auth";
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate(); 

  const userRole = localStorage.getItem("role"); 
  const isLoggedIn = !!localStorage.getItem("token");

  const isActive = (path) => location.pathname === path;

  const allIcons = [
    { path: "/", Icon: Home, alt: "Home", roles: ["Chef", "User", "Admin", "Guest"] },
    { path: "/recipe", Icon: BookOpen, alt: "Recipe", roles: ["User", "Admin", "Guest"] },
    { path: "/chefrecipe", Icon: BookOpen, alt: "Recipe", roles: ["Chef"] },
    { path: "/checkstatus", Icon: Bell, alt: "Notification", roles: ["User", "Chef"] },
    { path: "/course", Icon: GraduationCap, alt: "Course", roles: ["User", "Admin", "Guest"] },
    { path: "/chefcourse", Icon: GraduationCap, alt: "Course", roles: ["Chef"] },
    { path: "/profile", Icon: User, alt: "Profile", roles: ["Chef", "User", "Admin"] }, // Remove Guest from profile
  ];

  const icons = allIcons.filter(icon =>
    (isLoggedIn && icon.roles.includes(userRole)) || 
    (!isLoggedIn && icon.roles.includes("Guest"))
  );

  const handleIconClick = (path, roles) => {
    if (!isLoggedIn && !roles.includes("Guest")) {
      alert("Please log in to access this page.");
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    if (userRole === "Admin") {
      navigate("/admin"); 
    } else {
      logoutUser(); 
    }
  };

  const handleLogin = () => {
    navigate("/login"); // Adjust this path to your actual login route
  };

  return (
    <nav className="fixed top-0 left-0 h-full w-16 bg-black flex flex-col items-center py-8">
      {/* Logo Section */}
      <div className="mb-16">
        <img src={logo} alt="Logo" className="w-10 h-10" />
      </div>

      {/* Main Nav Icons */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-12">
        {icons.map(({ path, Icon, alt, roles }) => (
          <button
            key={path}
            onClick={() => handleIconClick(path, roles)}
            className="group flex items-center justify-center focus:outline-none"
          >
            <Icon
              className={`w-6 h-6 transition-all duration-200 ${
                isActive(path)
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Login/Logout Button - Show appropriate button based on login status */}
      <div className="mt-auto pt-8">
        {isLoggedIn ? (
          // Logout button for logged-in users
          <button
            onClick={handleLogout} 
            className="text-gray-400 hover:text-red-400 transition-colors duration-200 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </button>
        ) : (
          // Login button for guests
          <button
            onClick={handleLogin} 
            className="text-gray-400 hover:text-green-400 transition-colors duration-200 group"
            title="Login"
          >
            <LogIn className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;