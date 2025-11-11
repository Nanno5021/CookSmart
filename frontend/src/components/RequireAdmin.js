import React from "react";
import { Navigate } from "react-router-dom";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role; 

    if (userRole !== "Admin") {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" replace />;
  }
}

export default RequireAdmin;
