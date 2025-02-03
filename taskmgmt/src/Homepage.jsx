import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css"; // Import modern contrast themed CSS

function Homepage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/get-tasks/${user.id}`
        );
        setTasks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const getCardColor = (status) => {
    if (status === "Completed") return "#cfffca";
    if (status === "To Review") return "#ffe1ca";
    if (status === "Rejected") return "#ffb3b3";
    return "white";
  };

  const getPriorityColor = (priority) => {
    if (priority === "High Priority") return "red";
    if (priority === "Medium Priority") return "orange";
    return "green"; // Low Priority
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "High") return "red";
    if (difficulty === "Medium") return "orange";
    return "green"; // Easy
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/update-task-status`, {
        taskId,
        status: "To Review",
      });

      // Update the task status locally
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: "To Review" } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const navigateToModeratorHomepage = () => {
    navigate("/moderator-homepage");
  };

  return (
    <div className="homepage-container">
      {/* Top Bar with Welcome and Logout */}
      <div className="top-bar">
        <h2 className="homepage-title">Welcome, {user.first_name}</h2>
        <div>
          {user.role === "Moderator" && (
            <button
              className="moderator-btn"
              onClick={navigateToModeratorHomepage}
            >
              Moderator Tasks
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-container">
          {tasks.length === 0 ? (
            <p>No tasks assigned</p>
          ) : (
            <div className="tasks-card-container">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  style={{ backgroundColor: getCardColor(task.status) }}
                >
                  <div
                    className="priority-indicator"
                    style={{
                      backgroundColor: getPriorityColor(task.priority_level),
                    }}
                  ></div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <p>Status: {task.status}</p>
                    <p>
                      Due Date: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                    <p
                      className="task-difficulty"
                      style={{ color: getDifficultyColor(task.difficulty) }}
                    >
                      Difficulty: {task.difficulty}
                    </p>
                  </div>
                  <button
                    className="complete-task-btn"
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={
                      task.status === "To Review" || task.status === "Completed"
                    }
                  >
                    Complete this task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Homepage;
