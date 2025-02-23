import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminLogs.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/get-admin-logs")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setLogs([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        setError("Failed to load logs");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-logs-container">
      <h2>Admin Logs</h2>
      <table className="logs-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={index}>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No logs available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;
