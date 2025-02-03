import React, { useState } from "react";
import axios from "axios";
import "./Modal.css";

function EditTaskModal({ task, users, handleClose, refreshTasks }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    user_id: task.user_id,
    status: task.status,
    due_date: task.due_date,
    difficulty: task.difficulty,
    priority_level: task.priority_level,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.id) {
      console.error("Error: task_id is missing or undefined");
      alert("Task ID is missing.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/update-task/${task.id}`,
        formData
      );
      alert("Task updated successfully!");
      refreshTasks(); // Refresh the task list after update
      handleClose(); // Close the modal
    } catch (error) {
      console.error(error);
      alert("Error updating task");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-task/${task.id}`);
      alert("Task deleted successfully!");
      refreshTasks(); // Refresh the task list after delete
      handleClose(); // Close the modal
    } catch (error) {
      console.error(error);
      alert("Error deleting task");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">Edit Task</h2>
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="text"
            name="description"
            placeholder="Task Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <select
            className="input-field"
            name="user_id"
            value={formData.user_id}
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
          <select
            className="input-field"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <input
            className="input-field"
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
          <select
            className="input-field"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            className="input-field"
            name="priority_level"
            value={formData.priority_level}
            onChange={handleChange}
            required
          >
            <option value="Low Priority">Low Priority</option>
            <option value="Medium Priority">Medium Priority</option>
            <option value="High Priority">High Priority</option>
          </select>
          <div className="button-container">
            <button className="action-button" type="submit">
              Update Task
            </button>
            <button
              className="action-button delete-button"
              type="button"
              onClick={handleDelete}
            >
              Delete Task
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

export default EditTaskModal;
