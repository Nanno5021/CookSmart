import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyOtp, resetPassword } from "../api/auth";
import logo from "../assets/logo.png";
import loginBackground from "../assets/login_background.png";

function VerifyOTPPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("verify"); // "verify" or "reset"

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
        console.log("Verifying OTP:", { email, otp: formData.otp });
        const data = await verifyOtp(email, formData.otp);
        console.log("OTP verification response:", data);
        setMessage(data.message || "OTP verified successfully!");
        setStep("reset");
    } catch (error) {
        console.error("OTP verification error:", error);
        setMessage("Error: " + error.message);
    } finally {
        setIsLoading(false);
    }
    };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const data = await resetPassword(email, formData.otp, formData.newPassword);
      setMessage(data.message || "Password reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
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

      {/* OTP Verification Form */}
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
          {step === "verify" ? "Verify OTP" : "Reset Password"}
        </h2>

        <p style={{ marginBottom: "25px", fontSize: "14px" }}>
          {step === "verify" 
            ? `Enter the OTP sent to ${email}`
            : "Enter your new password"
          }
        </p>

        <form onSubmit={step === "verify" ? handleVerifyOtp : handleResetPassword}>
          {step === "verify" ? (
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
              maxLength="6"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                borderRadius: "5px",
                textAlign: "center",
                fontSize: "18px",
                letterSpacing: "8px"
              }}
            />
          ) : (
            <>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </>
          )}

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
            {isLoading 
              ? "Processing..." 
              : step === "verify" ? "Verify OTP" : "Reset Password"
            }
          </button>
        </form>
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

export default VerifyOTPPage;