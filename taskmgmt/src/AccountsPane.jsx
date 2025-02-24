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

  // Get admin info from session storage
  const adminInfo = JSON.parse(sessionStorage.getItem("adminInfo"));

  useEffect(() => {
    if (!adminInfo) {
      console.error("No admin information found");
      return;
    }
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
    if (!adminInfo) {
      console.error("No admin information found");
      return;
    }

    console.log("Admin info for logging:", adminInfo);

    const userDataWithAdmin = {
      ...newUser,
      adminId: adminInfo.id,
      adminName: `${adminInfo.first_name} ${adminInfo.last_name}`,
    };

    console.log("Sending user data with admin info:", userDataWithAdmin);

    axios
      .post("http://localhost:5000/api/register", userDataWithAdmin)
      .then((response) => {
        console.log("User registration response:", response.data);
        fetchUsers();
        setShowAddModal(false);
        setNewUser({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
        });
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        alert(error.response?.data?.message || "Error adding user");
      });
  };

  const handleUpdateUser = () => {
    if (!adminInfo) {
      console.error("No admin information found");
      return;
    }

    const updateData = {
      ...selectedUser,
      adminId: adminInfo.id,
      adminName: `${adminInfo.first_name} ${adminInfo.last_name}`,
    };

    console.log("Sending update data with admin info:", updateData);

    axios
      .put(
        `http://localhost:5000/api/update-user/${selectedUser.id}`,
        updateData
      )
      .then((response) => {
        console.log("User update response:", response.data);
        fetchUsers();
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        alert(error.response?.data?.message || "Error updating user");
      });
  };

  const handleDeleteUser = () => {
    if (!adminInfo) {
      console.error("No admin information found");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    console.log("Sending delete request with admin info:", {
      adminId: adminInfo.id,
      adminName: `${adminInfo.first_name} ${adminInfo.last_name}`,
    });

    axios
      .delete(`http://localhost:5000/api/delete-user/${selectedUser.id}`, {
        data: {
          adminId: adminInfo.id,
          adminName: `${adminInfo.first_name} ${adminInfo.last_name}`,
        },
      })
      .then((response) => {
        console.log("User deletion response:", response.data);
        fetchUsers();
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Error deleting user");
      });
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
