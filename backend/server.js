const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing the password

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "task_management",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

// Generate random ID
const generateRandomId = () => {
  return crypto.randomBytes(16).toString("hex"); // Random 32-character hexadecimal string
};

app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

  const id = generateRandomId(); // Generate random id
  const query =
    "INSERT INTO user_accounts (id, email, password, first_name, last_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [id, email, hashedPassword, firstName, lastName, phoneNumber, "user"],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error registering user" });
      } else {
        res.status(200).send({ message: "User registered successfully" });
      }
    }
  );
});
app.post("/api/adminregister", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

  const id = generateRandomId(); // Generate random id
  const query =
    "INSERT INTO admin_accounts (id, email, password, first_name, last_name, phone_number) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [id, email, hashedPassword, firstName, lastName, phoneNumber],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error registering user" });
      } else {
        res.status(200).send({ message: "User registered successfully" });
      }
    }
  );
});
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM user_accounts WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error logging in" });
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare the hashed password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Send user data on successful login
        return res.status(200).send({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          },
        });
      } else {
        return res.status(401).send({ message: "Invalid credentials" });
      }
    } else {
      return res.status(401).send({ message: "Invalid credentials" });
    }
  });
});
app.post("/api/login-admin", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM admin_accounts WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error logging in" });
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare the hashed password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Send user data on successful login
        return res.status(200).send({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          },
        });
      } else {
        return res.status(401).send({ message: "Invalid credentials" });
      }
    } else {
      return res.status(401).send({ message: "Invalid credentials" });
    }
  });
});

// Assign Task API Endpoint (for Admin)
app.post("/api/assign-task", (req, res) => {
  const {
    userId,
    title,
    description,
    status,
    due_date,
    difficulty,
    priority_level,
  } = req.body;
  const taskId = generateRandomId();
  const query =
    "INSERT INTO tasks (id, user_id, title, description, status, due_date, difficulty, priority_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      taskId,
      userId,
      title,
      description,
      status,
      due_date,
      difficulty,
      priority_level,
    ],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error assigning task" });
      } else {
        res.status(200).send({ message: "Task assigned successfully" });
      }
    }
  );
});

app.get("/api/get-tasks", (req, res) => {
  const query = `
      SELECT 
        tasks.*, 
        user_accounts.first_name AS user_first_name, 
        user_accounts.last_name AS user_last_name 
      FROM tasks 
      JOIN user_accounts 
      ON tasks.user_id = user_accounts.id`;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching tasks" });
    } else {
      res.status(200).send(results);
    }
  });
});
app.get("/api/get-tasks/:userId", (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter

  // Query to get tasks related to the user
  const query = `
      SELECT 
        tasks.*, 
        user_accounts.first_name AS user_first_name, 
        user_accounts.last_name AS user_last_name 
      FROM tasks 
      JOIN user_accounts 
      ON tasks.user_id = user_accounts.id
      WHERE tasks.user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error fetching tasks" });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: "No tasks found for this user" });
    }

    res.status(200).send(results); // Send the tasks data back to the client
  });
});
app.put("/api/update-task-status", async (req, res) => {
  const { taskId, status } = req.body;
  try {
    await db.query("UPDATE tasks SET status = ? WHERE id = ?", [
      status,
      taskId,
    ]);
    res.status(200).send({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).send({ error: "Failed to update task status" });
  }
});
// Fetch all users for the task assignment dropdown
app.get("/api/get-users", (req, res) => {
  const query = "SELECT * FROM user_accounts";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching users" });
    } else {
      res.status(200).send(results);
    }
  });
});
app.put("/api/update-task/:task_id", (req, res) => {
  const { task_id } = req.params;
  const {
    title,
    description,
    user_id,
    status,
    due_date,
    difficulty,
    priority_level,
  } = req.body;

  // Ensure that the data types and values being sent are valid for the database fields.
  const query = `
        UPDATE tasks
        SET title = ?, description = ?, user_id = ?, status = ?, due_date = ?, difficulty = ?, priority_level = ?
        WHERE id = ?`;

  db.query(
    query,
    [
      title,
      description,
      user_id,
      status,
      due_date,
      difficulty,
      priority_level,
      task_id,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: "Error updating task" });
      }
      res.status(200).send({ message: "Task updated successfully" });
    }
  );
});

// Delete Task
app.delete("/api/delete-task/:task_id", (req, res) => {
  const { task_id } = req.params;
  const query = "DELETE FROM tasks WHERE id = ?";

  db.query(query, [task_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error deleting task" });
    }
    res.status(200).send({ message: "Task deleted successfully" });
  });
});

app.put("/api/update-user/:id", (req, res) => {
  const { email, first_name, last_name, phone_number, role, password } =
    req.body;
  const userId = req.params.id;

  // Check if password is provided, and hash it if it is
  let hashedPassword = null;
  if (password) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: "Error hashing password" });
      }

      hashedPassword = hash;

      // Perform the update query, including hashed password if provided
      const query =
        "UPDATE user_accounts SET email = ?, first_name = ?, last_name = ?, phone_number = ?, role = ?, password = ? WHERE id = ?";

      db.query(
        query,
        [
          email,
          first_name,
          last_name,
          phone_number,
          role,
          hashedPassword,
          userId,
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send({ message: "Error updating user" });
          } else {
            res.status(200).send({ message: "User updated successfully" });
          }
        }
      );
    });
  } else {
    // If no password provided, update without changing password
    const query =
      "UPDATE user_accounts SET email = ?, first_name = ?, last_name = ?, phone_number = ?, role = ? WHERE id = ?";

    db.query(
      query,
      [email, first_name, last_name, phone_number, role, userId],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: "Error updating user" });
        } else {
          res.status(200).send({ message: "User updated successfully" });
        }
      }
    );
  }
});

// Delete account endpoint
app.delete("/api/delete-user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM user_accounts WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error deleting user" });
    } else {
      res.status(200).send({ message: "User deleted successfully" });
    }
  });
});

// Get all tasks with status "To Review"
app.get("/api/get-to-review-tasks", (req, res) => {
  const query = `SELECT 
        tasks.id, tasks.title, tasks.description, tasks.status, tasks.due_date, 
        user_accounts.first_name, user_accounts.last_name 
      FROM tasks 
      JOIN user_accounts ON tasks.user_id = user_accounts.id
      WHERE tasks.status = ?;`
  const status = "To Review";

  db.query(query, [status], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error fetching tasks" });
    }
    res.status(200).send(results);
  });
});
// Update task status
app.put("/api/update-task-status", (req, res) => {
  const { taskId, status } = req.body;

  if (!taskId || !status) {
    return res.status(400).send({ message: "taskId and status are required" });
  }

  const query = "UPDATE tasks SET status = ? WHERE id = ?";

  db.query(query, [status, taskId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error updating task status" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).send({ message: "Task not found" });
    }

    res.status(200).send({ message: "Task status updated successfully" });
  });
});

app.get("/api/get-task-stats", (req, res) => {
  const query = `
    SELECT 
      user_accounts.id AS user_id,
      user_accounts.first_name,
      user_accounts.last_name,
      COUNT(tasks.id) AS total_tasks,
      SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
    FROM user_accounts
    LEFT JOIN tasks ON user_accounts.id = tasks.user_id
    GROUP BY user_accounts.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching task stats:", err);
      return res.status(500).send({ message: "Error fetching task stats" });
    }

    // Transform the results into the desired format
    const taskStats = results.map((row) => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      completed: row.completed_tasks || 0,
      total: row.total_tasks || 0,
    }));

    res.status(200).send(taskStats);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
