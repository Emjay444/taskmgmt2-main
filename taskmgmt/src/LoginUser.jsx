import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginAdmin.css";

function LoginUser() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [failedAttempts, setFailedAttempts] = useState(
    parseInt(localStorage.getItem("failedAttempts")) || 0
  );
  const [cooldown, setCooldown] = useState(
    parseInt(localStorage.getItem("cooldownTimestamp")) || null
  );
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown) {
      const remainingTime = cooldown - Date.now();
      if (remainingTime > 0) {
        setIsCooldownActive(true);
        setTimeout(() => {
          setIsCooldownActive(false);
          localStorage.removeItem("cooldownTimestamp");
        }, remainingTime);
      } else {
        localStorage.removeItem("cooldownTimestamp");
        setIsCooldownActive(false);
      }
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCooldownActive) {
      alert("Too many failed attempts. Please wait before trying again.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        formData
      );

      if (response.data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.removeItem("failedAttempts"); // Reset failed attempts on success
        navigate("/homepage");
      } else {
        handleFailedAttempt();
      }
    } catch (error) {
      console.error(error);
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    localStorage.setItem("failedAttempts", newFailedAttempts);

    if (newFailedAttempts >= 5) {
      const cooldownTime = Date.now() + 10000; // 10 seconds cooldown
      localStorage.setItem("cooldownTimestamp", cooldownTime);
      setCooldown(cooldownTime);
      setIsCooldownActive(true);

      setTimeout(() => {
        setFailedAttempts(0);
        localStorage.removeItem("failedAttempts");
        localStorage.removeItem("cooldownTimestamp");
        setIsCooldownActive(false);
      }, 10000);
    } else {
      alert("Login failed! Attempts: " + newFailedAttempts);
    }
  };

  return (
    <div className="login-container">
      <h2>User Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isCooldownActive}
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isCooldownActive}
        />
        <button
          className="login-button"
          type="submit"
          disabled={isCooldownActive}
        >
          {isCooldownActive ? "Cooldown Active" : "Login"}
        </button>
      </form>
      <div className="login-link">
        <p>
          No account? <a href="/">register here</a>
        </p>
      </div>
    </div>
  );
}

export default LoginUser;
