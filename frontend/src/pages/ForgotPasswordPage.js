import React, { useState } from "react";
import { requestPasswordReset } from "../api/auth";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import loginBackground from "../assets/login_background.png";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || "OTP has been sent to your email!");
      
      // Redirect to OTP verification page after successful request
      setTimeout(() => {
        window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
      }, 2000);
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${loginBackground})`,
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

      {/* Forgot Password Form */}
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
          Reset Your Password
        </h2>

        <p style={{ marginBottom: "25px", fontSize: "14px" }}>
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {message && (
            <div
              style={{
                padding: "10px",
                marginBottom: "20px",
                backgroundColor: message.includes("Error") ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)",
                borderRadius: "5px",
                fontSize: "14px",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isLoading ? "gray" : "white",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Remember your password?{" "}
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "underline",
            }}
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;