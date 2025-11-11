import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import registerBackground from "../assets/register_background.png";

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const { confirmPassword, ...dataToSend } = formData;
    dataToSend.role = "User"; 
    
    const data = await registerUser(dataToSend);
    alert(data.message || "Registration successful!");
    console.log("Registered:", data);
  } catch (error) {
    alert("Error: " + error.message);
  }
};

  return (
    <div
      style={{
        backgroundImage: `url(${registerBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Dimmed Overlay */}
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
        src={logo}
        alt="Logo"
        style={{
          position: "absolute",
          top: "30px",
          left: "40px",
          width: "150px",
          zIndex: 1,
        }}
      />

      {/* Registration Form */}
      <div
        style={{
          zIndex: 1,
          margin: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "40px 60px",
          borderRadius: "15px",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          color: "white",
          width: "450px",
        }}
      >
        <h2 style={{ fontSize: "28px", marginBottom: "30px" }}>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={inputStyle}
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
              marginTop: "10px",
            }}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "underline",
            }}
          >
            Log In here.
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

export default RegisterPage;
