import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Bell, GraduationCap, User, LogOut, ChefHat } from "lucide-react";
import { logoutUser } from "../api/auth";
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();

  const userRole = localStorage.getItem("role"); 

  const isActive = (path) => location.pathname === path;

  const allIcons = [
    { path: "/", Icon: Home, alt: "Home", roles: ["Chef", "User"] },
    { path: "/recipe", Icon: BookOpen, alt: "Recipe", roles: ["User"] },
    { path: "/chefrecipe", Icon: BookOpen, alt: "Recipe", roles: ["Chef"] },
    { path: "/notification", Icon: Bell, alt: "Notification", roles: ["Chef", "User"] },
    { path: "/course", Icon: GraduationCap, alt: "Course", roles: ["User"] }, 
    { path: "/chefcourse", Icon: GraduationCap, alt: "Course", roles: ["Chef"] }, 
    { path: "/profile", Icon: User, alt: "Profile", roles: ["Chef", "User"] },
  ];

  const icons = allIcons.filter(icon => 
    icon.roles.includes(userRole) || !userRole 
  );

  return (
    <nav className="fixed top-0 left-0 h-full w-20 bg-black flex flex-col items-center py-6">
      <div className="mb-10">
        <img src={logo} alt="Logo" className="w-12 h-12" />
        {/* <ChefHat className="w-12 h-12 text-white" /> */}
      </div>

      {/* Main Nav Icons */}
      <div className="flex flex-col justify-center flex-1">
        {icons.map(({ path, Icon, alt }) => (
          <Link key={path} to={path} className="my-10">
            <Icon
              className={`w-8 h-8 transition duration-300 ${
                isActive(path) 
                  ? "text-white scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" 
                  : "text-gray-500"
              }`}
            />
          </Link>
        ))}
      </div>

      <button
        onClick={logoutUser}
        className="mb-4 text-gray-400 hover:text-red-500 transition font-semibold text-sm"
      >
        <LogOut className="w-6 h-6 opacity-80 hover:opacity-100 transition" />
      </button>
    </nav>
  );
}

export default Navbar;