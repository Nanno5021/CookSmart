import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom"; 

function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: ""
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
      console.log("Logged in:", data);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      navigate("/"); 
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{
      backgroundImage: "url('/login_background.png')",
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

      {/* Login Form */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1
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
          }}>Log into your account</h2>
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Username/Email"
              value={formData.usernameOrEmail}
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
              Log In
            </button>
          </form>

          <div style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px"
          }}>
            Don't have an account? <Link to="/register" style={{ textDecoration: "underline", color: "#007bff" }}>Register here.</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;