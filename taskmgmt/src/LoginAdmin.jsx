import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Use this for programmatic navigation
import axios from "axios";
import "./LoginAdmin.css"; // Import the modern contrast themed CSS

function LoginAdmin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // Initialize navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login-admin",
        formData
      );

      if (response.data.message === "Login successful") {
        // Save the user's info to localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect to homepage
        navigate("/admin-dashboard");
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed!");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
      <div className="login-link">
        <p>
          Not an admin? <Link to="/login">sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginAdmin;
