import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Register.css"; // Make sure to create or modify this CSS file

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/adminregister",
        formData
      );
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="register-input"
          />
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
      <p className="register-text">
        Already have an account?{" "}
        <Link to="/login" className="register-link">
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Register;
