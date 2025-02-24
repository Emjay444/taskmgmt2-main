import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminLogs.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    console.log("Fetching admin logs...");
    setLoading(true);
    setError(null);

    axios
      .get("http://localhost:5000/api/get-admin-logs")
      .then((response) => {
        console.log("Received logs:", response.data);
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Received invalid data format from server");
          setLogs([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching logs:", error.response || error);
        setError(error.response?.data?.message || "Failed to load logs");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  };

  const getActionColor = (action) => {
    if (!action) return "";
    switch (action.toLowerCase()) {
      case "create":
        return "log-action-create";
      case "delete":
        return "log-action-delete";
      case "update":
        return "log-action-update";
      default:
        return "";
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp || "Invalid Date";
    }
  };

  if (loading) return <div className="loading">Loading logs...</div>;
  if (error)
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchLogs}>Try Again</button>
      </div>
    );

  return (
    <div className="admin-logs-container">
      <h2>Admin Activity Logs</h2>
      <div className="refresh-button">
        <button onClick={fetchLogs}>Refresh Logs</button>
      </div>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Admin ID</th>
            <th>Admin Name</th>
            <th>Action</th>
            <th>Target Account</th>
            <th>Details</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={`${log.admin_id}-${log.timestamp}`}>
                <td>{log.admin_id}</td>
                <td>{log.admin_name}</td>
                <td className={getActionColor(log.action)}>
                  {(log.action || "Unknown").toUpperCase()}
                </td>
                <td>{log.target_account}</td>
                <td>{log.details}</td>
                <td>{formatTimestamp(log.timestamp)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-logs">
                No admin logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;
