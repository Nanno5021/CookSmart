import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-center space-x-6 bg-gray-800 py-4 shadow-md">
      <Link to="/" className="hover:text-blue-400">Home</Link>
      <Link to="/profile" className="hover:text-blue-400">Profile</Link>
      <Link to="/login" className="hover:text-blue-400">Login</Link>
      <Link to="/register" className="hover:text-blue-400">Register</Link>
    </nav>
  );
}

export default Navbar;
