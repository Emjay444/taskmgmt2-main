import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ModeratorHomepage.css"; // Add specific CSS for this page if needed

function ModeratorHomepage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Moderator") {
      navigate("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/get-to-review-tasks`
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

  const handleConfirmTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/update-task-status`, {
        taskId,
        status: "Completed",
      });

      // Remove the task from the list locally
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleRejectTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/update-task-status`, {
        taskId,
        status: "Rejected",
      });

      // Remove the task from the list locally
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleBackToHomepage = () => {
    navigate("/homepage");
  };

  return (
    <div className="moderator-homepage-container">
      <div className="top-bar">
        <h2>Moderator Dashboard</h2>
        <button className="back-btn" onClick={handleBackToHomepage}>
          Back to Homepage
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-container">
          {tasks.length === 0 ? (
            <p>No tasks to review</p>
          ) : (
            <div className="tasks-card-container">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="names">
                  <p className="task-title">{`For: ${task.first_name} ${task.last_name}`}</p>
                  
                  </div>

                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <p>Status: {task.status}</p>
                    <p>
                      Due Date: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="confirm-task-btn"
                    onClick={() => handleConfirmTask(task.id)}
                  >
                    Confirm as Completed
                  </button>
                  <button
                    className="reject-task-btn"
                    onClick={() => handleRejectTask(task.id)}
                  >
                    Reject Task
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

export default ModeratorHomepage;
