import React from "react";
import { Link, useLocation } from "react-router-dom";
import homeIcon from "../assets/home.png";
import recipeIcon from "../assets/recipe.png";
import notifIcon from "../assets/notification.png";
import courseIcon from "../assets/course.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.png";
import logoutIcon from "../assets/logout.png";
import { logoutUser } from "../api/auth";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const icons = [
    { path: "/", img: homeIcon, alt: "Home" },
    { path: "/recipe", img: recipeIcon, alt: "Recipe" },
    { path: "/notification", img: notifIcon, alt: "Notification" },
    { path: "/course", img: courseIcon, alt: "Course" },
    { path: "/profile", img: profileIcon, alt: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 h-full w-20 bg-black flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-10">
        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
      </div>

      {/* Main Nav Icons */}
      <div className="flex flex-col justify-center flex-1">
        {icons.map(({ path, img, alt }) => (
          <Link key={path} to={path} className="my-10">
            <img
              src={img}
              alt={alt}
              className={`w-8 h-8 transition duration-300 ${
                isActive(path) ? "scale-110" : "opacity-80"
              }`}
              style={{
                background: "transparent",
                filter: isActive(path)
                  ? "grayscale(100%) brightness(200%) invert(100%) drop-shadow(0 0 6px rgba(255,255,255,0.6))"
                  : "grayscale(100%) brightness(40%) invert(100%)",
              }}
            />
          </Link>
        ))}
      </div>

      {/* ✅ Logout Button at Bottom */}
      <button
        onClick={logoutUser}
        className="mb-4 text-gray-400 hover:text-red-500 transition font-semibold text-sm"
      >
        {logoutIcon ? (
          <img
            src={logoutIcon}
            alt="Logout"
            className="w-6 h-6 opacity-80 hover:opacity-100 transition"
          />
        ) : (
          "Logout"
        )}
      </button>
    </nav>
  );
}

export default Navbar;
