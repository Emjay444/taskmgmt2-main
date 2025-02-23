import React from "react";
import "./AdminDashboard.css";

function Sidebar({ activePane, setActivePane, handleLogout }) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-menu">
        <li
          className={activePane === "dashboard" ? "active" : ""}
          onClick={() => setActivePane("dashboard")}
        >
          Dashboard
        </li>
        <li
          className={activePane === "tasks" ? "active" : ""}
          onClick={() => setActivePane("tasks")}
        >
          Tasks
        </li>
        <li
          className={activePane === "accounts" ? "active" : ""}
          onClick={() => setActivePane("accounts")}
        >
          Accounts
        </li>
        <li
          className={activePane === "adminlogs" ? "active" : ""}
          onClick={() => setActivePane("adminlogs")}
        >
          Admin Logs
        </li>
      </ul>
      {/* Logout Button */}
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
