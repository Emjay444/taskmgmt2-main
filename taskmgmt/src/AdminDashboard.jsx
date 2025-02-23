import React, { useState } from "react";
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
    localStorage.clear();
    sessionStorage.clear();
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
