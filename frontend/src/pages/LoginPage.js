import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

// ✅ Import images correctly
import logo from "../assets/logo.png";
import loginBackground from "../assets/login_background.png";

function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);
      alert("Login successful!");

      if (data.token) {
        localStorage.setItem("token", data.token);

        // ✅ Decode token payload
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const userRole = payload.role; // <-- Your JWT uses `role`

        console.log("Logged in role:", userRole);

        // ✅ Redirect based on role
        if (userRole === "Admin") {
          navigate("/admin", { replace: true });
        } else if (userRole === "Chef") {
          navigate("/chef", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };


  return (
    <div
      style={{
        backgroundImage: `url(${loginBackground})`, // ✅ use imported background
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Dim overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 0,
        }}
      />

      {/* Logo */}
      <img
        src={logo} // ✅ use imported logo
        alt="Logo"
        style={{
          position: "absolute",
          top: "30px",
          left: "40px",
          width: "150px",
          zIndex: 1,
        }}
      />

      {/* Login Form */}
      <div
        style={{
          zIndex: 1,
          margin: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "50px 60px",
          borderRadius: "15px",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          color: "white",
          width: "400px",
        }}
      >
        <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>
          Log into your account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="identifier"
            placeholder="Username / Email"
            value={formData.identifier}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "25px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "white",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Log In
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Don’t have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "white",
              textDecoration: "underline",
            }}
          >
            Register here.
          </Link>
        </p>

        
      </div>
    </div>
  );
}

export default LoginPage;
