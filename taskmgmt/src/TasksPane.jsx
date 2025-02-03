import React, { useState, useEffect } from "react";
import axios from "axios";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import "./TasksPane.css"; // Import the CSS file for styling

function TasksPane() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    // Fetch tasks and users
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = () => {
    axios.get("http://localhost:5000/api/get-tasks").then((response) => {
      setTasks(response.data);
    });
  };

  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/get-users").then((response) => {
      setUsers(response.data);
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);

  return (
    <div className="tasks-pane">
      <div className="tasks-header">
        <h2>All Tasks</h2>
        <button
          className="add-task-button"
          onClick={() => setShowAddModal(true)}
        >
          Add Task
        </button>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th>Task Title</th>
            <th>Task Description</th>
            <th>Assigned User</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Difficulty</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => handleTaskClick(task)}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{`${task.user_first_name} ${task.user_last_name}`}</td>{" "}
              <td>{task.status}</td>
              <td>{task.due_date}</td>
              <td>{task.difficulty}</td>
              <td>{task.priority_level}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <AddTaskModal
          users={users}
          handleClose={handleCloseAddModal}
          refreshTasks={fetchTasks}
        />
      )}

      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          users={users}
          handleClose={handleCloseEditModal}
          refreshTasks={fetchTasks}
        />
      )}
    </div>
  );
}

export default TasksPane;
