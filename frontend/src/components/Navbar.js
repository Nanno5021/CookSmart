import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import { Home, BookOpen, Bell, GraduationCap, User, LogOut } from "lucide-react";
import { logoutUser } from "../api/auth";
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ hook for navigation

  const userRole = localStorage.getItem("role"); 

  const isActive = (path) => location.pathname === path;

  const allIcons = [
    { path: "/", Icon: Home, alt: "Home", roles: ["Chef", "User", "Admin"] },
    { path: "/recipe", Icon: BookOpen, alt: "Recipe", roles: ["User", "Admin"] },
    { path: "/chefrecipe", Icon: BookOpen, alt: "Recipe", roles: ["Chef"] },
    { path: "/checkstatus", Icon: Bell, alt: "Notification", roles: ["User", "Chef"] },
    { path: "/course", Icon: GraduationCap, alt: "Course", roles: ["User", "Admin"] },
    { path: "/chefcourse", Icon: GraduationCap, alt: "Course", roles: ["Chef"] },
    { path: "/profile", Icon: User, alt: "Profile", roles: ["Chef", "User", "Admin"] },
  ];

  const icons = allIcons.filter(icon =>
    icon.roles.includes(userRole) || !userRole
  );


  const handleLogout = () => {
    if (userRole === "Admin") {
      navigate("/admin"); 
    } else {
      logoutUser(); 
    }
  };

  return (
    <nav className="fixed top-0 left-0 h-full w-16 bg-black flex flex-col items-center py-8">
      {/* Logo Section */}
      <div className="mb-16">
        <img src={logo} alt="Logo" className="w-10 h-10" />
      </div>

      {/* Main Nav Icons */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-12">
        {icons.map(({ path, Icon, alt }) => (
          <Link
            key={path}
            to={path}
            className="group flex items-center justify-center"
          >
            <Icon
              className={`w-6 h-6 transition-all duration-200 ${
                isActive(path)
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
            />
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout} // ✅ use new function
          className="text-gray-400 hover:text-red-400 transition-colors duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
