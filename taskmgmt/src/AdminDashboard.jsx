import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardPane from "./DashboardPane";
import TasksPane from "./TasksPane";
import AccountsPane from "./AccountsPane";
import AdminLogs from "./AdminLogs"; // Import AdminLogs
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom"; // Use this for navigation

function AdminDashboard() {
  const [activePane, setActivePane] = useState("dashboard");
  const navigate = useNavigate(); // Initialize navigate function

  // Check for admin session on component mount
  useEffect(() => {
    const adminInfo = sessionStorage.getItem("adminInfo");
    if (!adminInfo) {
      navigate("/login-admin");
    }
  }, [navigate]);

  const renderPane = () => {
    switch (activePane) {
      case "dashboard":
        return <DashboardPane />;
      case "tasks":
        return <TasksPane />;
      case "accounts":
        return <AccountsPane />;
      case "adminlogs":
        return <AdminLogs />; // Include AdminLogs here
      default:
        return <DashboardPane />;
    }
  };

  const handleLogout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem("adminInfo");
    sessionStorage.removeItem("adminInfo");
    localStorage.removeItem("failedAttempts");
    localStorage.removeItem("cooldownTimestamp");
    navigate("/login-admin");
  };

  return (
    <div className="maincontent">
      <div className="admin-dashboard">
        <Sidebar
          activePane={activePane}
          setActivePane={setActivePane}
          handleLogout={handleLogout}
        />
        <div className="content">{renderPane()}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
