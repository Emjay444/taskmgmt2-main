import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardPane.css";

function DashboardPane() {
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [moderatorCount, setModeratorCount] = useState(0);

  useEffect(() => {
    // Fetch tasks
    axios.get("http://localhost:5000/api/get-tasks").then((response) => {
      setRecentTasks(response.data);
      setTaskCount(response.data.length);
    });

    // Fetch user data
    axios.get("http://localhost:5000/api/get-users").then((response) => {
      const users = response.data;
      setUserCount(users.length);

      // Count moderators by filtering users with role "Moderator"
      const moderators = users.filter((user) => user.role === "Moderator");
      setModeratorCount(moderators.length);
    });
  }, []);

  return (
    <div className="dashboard-container">
      <p className="header">Dashboard</p>
      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => console.log("Tasks clicked")}>
          <h3>{taskCount}</h3>
          <p>Tasks</p>
        </div>
        <div className="stat-card" onClick={() => console.log("Users clicked")}>
          <h3>{userCount}</h3>
          <p>Users</p>
        </div>
        <div
          className="stat-card"
          onClick={() => console.log("Moderators clicked")}
        >
          <h3>{moderatorCount}</h3>
          <p>Moderators</p>
        </div>
      </div>

      <div className="dashboard-pane">
        <h2 className="dashboard-title">Recently Updated Tasks</h2>
        <div className="dashboard-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Date Posted</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{`${task.user_first_name} ${task.user_last_name}`}</td>
                  <td>{task.status}</td>
                  <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  <td>{new Date(task.due_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPane;
