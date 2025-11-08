import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const data = await registerUser(formData);
      alert(data.message || "Registration successful!");
      console.log("Registered:", data);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{
      backgroundImage: "url('/register_background.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Dimmed overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1
      }}></div>

      {/* Logo */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "30px"
      }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{
            width: "150px",
            height: "auto"
          }}
        />
      </div>

      {/* Register Form */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        paddingBottom: "30px"
      }}>
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "50px 60px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          minWidth: "400px"
        }}>
          <h2 style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
            color: "#333"
          }}>Create your account</h2>
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "20px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "20px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "20px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />

            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "20px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
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
                padding: "15px",
                marginBottom: "20px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "25px",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
            
            <button 
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#fff",
                color: "#000",
                border: "2px solid #000",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#f0f0f0";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#fff";
              }}
            >
              Register
            </button>
          </form>

          <div style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px"
          }}>
            Already have an account? <Link to="/login" style={{ textDecoration: "underline", color: "#007bff" }}>Log In here.</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;