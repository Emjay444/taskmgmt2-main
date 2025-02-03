import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardPane from "./DashboardPane";
import TasksPane from "./TasksPane";
import AccountsPane from "./AccountsPane";
import "./AdminDashboard.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Use this for programmatic navigation

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
