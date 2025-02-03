import React, { useState } from "react";
import axios from "axios";
import "./Modal.css";

function AddTaskModal({ users, handleClose, refreshTasks }) {
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    status: "Pending",
    due_date: "",
    difficulty: "Easy",
    priority_level: "Low Priority",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/assign-task", formData);
      alert("Task assigned successfully!");
      refreshTasks(); // Refresh task list after new task assignment
      handleClose(); // Close the modal after task is added
    } catch (error) {
      console.error(error);
      alert("Error assigning task!");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Task</h3>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority Level</label>
            <select
              name="priority_level"
              value={formData.priority_level}
              onChange={handleChange}
            >
              <option value="Low Priority">Low Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="High Priority">High Priority</option>
            </select>
          </div>

          <div className="button-container">
            <button className="action-button" type="submit">
              Assign Task
            </button>
          </div>
        </form>

        <button className="close-button" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AddTaskModal;
