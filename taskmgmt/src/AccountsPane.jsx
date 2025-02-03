import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AccountsPane.css";

function AccountsPane() {
  const [users, setUsers] = useState([]);
  const [userTaskStats, setUserTaskStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchTaskStats();
  }, []);
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/get-task-stats")
      .then((response) => {
        // Transform array of stats into a dictionary for easier lookup
        const stats = response.data.reduce((acc, stat) => {
          acc[stat.userId] = {
            completed: stat.completed,
            total: stat.total,
          };
          return acc;
        }, {});
        setUserTaskStats(stats);
      })
      .catch((error) => console.error("Error fetching task stats", error));
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/get-users").then((response) => {
      setUsers(response.data);
    });
  };

  const fetchTaskStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/get-task-stats"
      );
      setUserTaskStats(response.data);
    } catch (error) {
      console.error("Error fetching task stats", error);
    }
  };

  const handleAddUser = () => {
    axios
      .post("http://localhost:5000/api/register", newUser)
      .then(() => {
        fetchUsers();
        setShowAddModal(false);
      })
      .catch((error) => console.error("Error adding user", error));
  };

  const handleUpdateUser = () => {
    axios
      .put(
        `http://localhost:5000/api/update-user/${selectedUser.id}`,
        selectedUser
      )
      .then(() => {
        fetchUsers();
        setShowEditModal(false);
      })
      .catch((error) => console.error("Error updating user", error));
  };

  const handleDeleteUser = () => {
    axios
      .delete(`http://localhost:5000/api/delete-user/${selectedUser.id}`)
      .then(() => {
        fetchUsers();
        setShowEditModal(false);
      })
      .catch((error) => console.error("Error deleting user", error));
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="accounts-pane">
      <h2>Manage Accounts</h2>
      <button
        className="add-account-button"
        onClick={() => setShowAddModal(true)}
      >
        Add Account
      </button>

      <table className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th>Tasks Completed</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const stats = userTaskStats[user.id] || { completed: 0, total: 0 };
            return (
              <tr key={user.id} onClick={() => handleOpenEditModal(user)}>
                <td>{user.email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.phone_number}</td>
                <td>{user.role}</td>
                <td>
                  {stats.completed}/{stats.total}
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal">
          <h3>Add User</h3>
          <label>Email:</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <label>Password:</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <label>First Name:</label>
          <input
            type="text"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
          />
          <label>Last Name:</label>
          <input
            type="text"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
          />
          <label>Phone Number:</label>
          <input
            type="text"
            value={newUser.phoneNumber}
            onChange={(e) =>
              setNewUser({ ...newUser, phoneNumber: e.target.value })
            }
          />
          <label>Role:</label>

          <button onClick={handleAddUser}>Add</button>
          <button onClick={() => setShowAddModal(false)}>Close</button>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User</h3>
            <label>Email:</label>
            <input
              type="email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
            />
            <label>Password:</label>
            <input
              type="password"
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, password: e.target.value })
              }
            />
            <label>First Name:</label>
            <input
              type="text"
              value={selectedUser.first_name}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, first_name: e.target.value })
              }
            />
            <label>Last Name:</label>
            <input
              type="text"
              value={selectedUser.last_name}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, last_name: e.target.value })
              }
            />
            <label>Phone Number:</label>
            <input
              type="text"
              value={selectedUser.phone_number}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  phone_number: e.target.value,
                })
              }
            />
            <label>Role:</label>
            <select
              value={selectedUser.role}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, role: e.target.value })
              }
            >
              <option value="User">User</option>
              <option value="Moderator">Moderator</option>
            </select>
            <div className="buttons">
              <button onClick={() => setShowEditModal(false)}>Close</button>
              <button onClick={handleUpdateUser}>Update</button>
              <button onClick={handleDeleteUser}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsPane;
