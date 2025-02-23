require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing the password
const { encrypt, decrypt } = require("./crypto");
const app = express();
const port = 5000;
const dotenv = require("dotenv").config();
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

  // Encrypt the incoming email for storage
  const encEmail = encrypt(email);

  // Fetch all emails from the database
  const checkEmailQuery = "SELECT email FROM user_accounts";

  db.query(checkEmailQuery, async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Database error" });
    }

    // Decrypt and check if the email already exists
    const emailExists = results.some((row) => decrypt(row.email) === email);

    if (emailExists) {
      return res.status(400).send({ message: "Email is already in use" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

    const encFirstName = encrypt(firstName);
    const encLastName = encrypt(lastName);
    const encPhoneNumber = encrypt(phoneNumber);
    const encUser = encrypt("user");

    const id = generateRandomId(); // Generate random ID
    const insertQuery =
      "INSERT INTO user_accounts (id, email, password, first_name, last_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(
      insertQuery,
      [id, encEmail, hashedPassword, encFirstName, encLastName, encPhoneNumber, encUser],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ message: "Error registering user" });
        } else {
          return res.status(200).send({ message: "User registered successfully" });
        }
      }
    );
  });
});

app.post("/api/adminregister", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10
const encEmail = encrypt(email);
const encFirstName = encrypt(firstName);
const encLastName = encrypt(lastName);
const encPhoneNumber = encrypt(phoneNumber);
const encUser = encrypt("user");

  const id = generateRandomId(); // Generate random id
  const query =
    "INSERT INTO admin_accounts (id, email, password, first_name, last_name, phone_number) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [id, encEmail, hashedPassword, encFirstName, encLastName, encPhoneNumber],
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

  // Fetch all users since emails are encrypted in DB
  const query = "SELECT * FROM user_accounts";
  db.query(query, async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error logging in" });
    }

    let user = null;
    for (let i = 0; i < results.length; i++) {
      const decryptedEmail = decrypt(results[i].email); // Decrypt stored email
      if (decryptedEmail === email) {
        user = results[i];
        break;
      }
    }

    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // 🔹 Compare password (assuming it's hashed with bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // 🔹 Decrypt other user details
    const decryptedEmail = decrypt(user.email);
    const decryptedFirstName = decrypt(user.first_name);
    const decryptedLastName = decrypt(user.last_name);
    const decryptedPhoneNumber = decrypt(user.phone_number);
    const decryptedRole = decrypt(user.role);

    return res.status(200).send({
      message: "Login successful",
      user: {
        id: user.id,
        email: decryptedEmail,
        first_name: decryptedFirstName,
        last_name: decryptedLastName,
        phone_number: decryptedPhoneNumber,
        role: decryptedRole
      },
    });
  });
});

app.post("/api/login-admin", (req, res) => {
  const { email, password } = req.body;

  // Fetch all users since emails are encrypted in DB
  const query = "SELECT * FROM admin_accounts";
  db.query(query, async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "Error logging in" });
    }

    let user = null;
    for (let i = 0; i < results.length; i++) {
      const decryptedEmail = decrypt(results[i].email); // Decrypt stored email
      if (decryptedEmail === email) {
        user = results[i];
        break;
      }
    }

    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // 🔹 Compare password (assuming it's hashed with bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // 🔹 Decrypt other user details
    const decryptedEmail = decrypt(user.email);
    const decryptedFirstName = decrypt(user.first_name);
    const decryptedLastName = decrypt(user.last_name);
    const decryptedPhoneNumber = decrypt(user.phone_number);

    return res.status(200).send({
      message: "Login successful",
      user: {
        id: user.id,
        email: decryptedEmail,
        first_name: decryptedFirstName,
        last_name: decryptedLastName,
        phone_number: decryptedPhoneNumber
      },
    });
  }); 
});

// 🔹 Assign Task - Encrypt before inserting
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
      encrypt(title),
      encrypt(description),
      encrypt(status),
      encrypt(due_date),
      encrypt(difficulty),
      encrypt(priority_level),
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

// 🔹 Get All Tasks - Decrypt before sending
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
      // Decrypt task details before sending
      const decryptedResults = results.map((task) => ({
        ...task,
        title: decrypt(task.title),
        description: decrypt(task.description),
        status: decrypt(task.status),
        due_date: decrypt(task.due_date),
        difficulty: decrypt(task.difficulty),
        priority_level: decrypt(task.priority_level),
        user_first_name: decrypt(task.user_first_name),
        user_last_name: decrypt(task.user_last_name),
      }));

      res.status(200).send(decryptedResults);
    }
  });
});

// 🔹 Get User-Specific Tasks - Decrypt before sending
app.get("/api/get-tasks/:userId", (req, res) => {
  const { userId } = req.params;

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

    // Decrypt task details before sending
    const decryptedResults = results.map((task) => ({
      ...task,
      title: decrypt(task.title),
      description: decrypt(task.description),
      status: decrypt(task.status),
      due_date: decrypt(task.due_date),
      difficulty: decrypt(task.difficulty),
      priority_level: decrypt(task.priority_level),
      user_first_name: decrypt(task.user_first_name),
      user_last_name: decrypt(task.user_last_name),
    }));

    res.status(200).send(decryptedResults);
  });
});

app.put("/api/update-task-status", async (req, res) => {
  const { taskId, status } = req.body;
  try {
    await db.query("UPDATE tasks SET status = ? WHERE id = ?", [
      encrypt(status),
      taskId,
    ]);
    res.status(200).send({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).send({ error: "Failed to update task status" });
  }
});

app.get("/api/get-users", (req, res) => {
  const query = "SELECT * FROM user_accounts";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching users" });
    } else {
      const decryptedResults = results.map((user) => ({
        id: user.id,
        email: decrypt(user.email),
        first_name: decrypt(user.first_name),
        last_name: decrypt(user.last_name),
        phone_number: decrypt(user.phone_number),
        role: decrypt(user.role),
      }));
      res.status(200).send(decryptedResults);
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

  const query = `
        UPDATE tasks
        SET title = ?, description = ?, user_id = ?, status = ?, due_date = ?, difficulty = ?, priority_level = ?
        WHERE id = ?`;

  db.query(
    query,
    [
      encrypt(title),
      encrypt(description),
      user_id,
      encrypt(status),
      encrypt(due_date),
      encrypt(difficulty),
      encrypt(priority_level),
      task_id,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: "Error updating task" });
      }
      res.status(200).send({ message: "Task updated successfully" });
    }
  );
});


app.delete("/api/delete-task/:task_id", (req, res) => {
  const { task_id } = req.params;
  const query = "DELETE FROM tasks WHERE id = ?";

  db.query(query, [task_id], (err) => {
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

  if (password) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: "Error hashing password" });
      }

      const query =
        "UPDATE user_accounts SET email = ?, first_name = ?, last_name = ?, phone_number = ?, role = ?, password = ? WHERE id = ?";

      db.query(
        query,
        [
          encrypt(email),
          encrypt(first_name),
          encrypt(last_name),
          encrypt(phone_number),
          encrypt(role),
          hash,
          userId,
        ],
        (err) => {
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
    const query =
      "UPDATE user_accounts SET email = ?, first_name = ?, last_name = ?, phone_number = ?, role = ? WHERE id = ?";

    db.query(
      query,
      [
        encrypt(email),
        encrypt(first_name),
        encrypt(last_name),
        encrypt(phone_number),
        encrypt(role),
        userId,
      ],
      (err) => {
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

  db.query(query, [userId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error deleting user" });
    } else {
      res.status(200).send({ message: "User deleted successfully" });
    }
  });
});

// 🔹 CRUD Operations for Admin Logs

// Create Admin Log Entry
app.post("/api/admin-logs", (req, res) => {
  const { admin_id, activity } = req.body;
  const logId = generateRandomId(); 
  const timestamp = new Date().toISOString(); 

  const query = "INSERT INTO admin_logs (id, admin_id, activity, timestamp) VALUES (?, ?, ?, ?)";

  db.query(query, [logId, admin_id, encrypt(activity), timestamp], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error logging admin activity" });
    } else {
      res.status(200).send({ message: "Admin log entry created successfully" });
    }
  });
});

// Get All Admin Logs
app.get("/api/admin-logs", (req, res) => {
  const query = "SELECT * FROM admin_logs ORDER BY timestamp DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching admin logs" });
    } else {
      const decryptedLogs = results.map((log) => ({
        id: log.id,
        admin_id: log.admin_id,
        activity: decrypt(log.activity),
        timestamp: log.timestamp,
      }));
      res.status(200).send(decryptedLogs);
    }
  });
});

// Delete Admin Log Entry
app.delete("/api/admin-logs/:id", (req, res) => {
  const logId = req.params.id;
  const query = "DELETE FROM admin_logs WHERE id = ?";

  db.query(query, [logId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Error deleting admin log entry" });
    } else {
      res.status(200).send({ message: "Admin log entry deleted successfully" });
    }
  });
});

// Get all tasks with status "To Review"
app.get("/api/get-to-review-tasks", (req, res) => {
  const query = `
    SELECT 
      tasks.id, tasks.title, tasks.description, tasks.status, tasks.due_date, 
      user_accounts.first_name, user_accounts.last_name 
    FROM tasks 
    JOIN user_accounts ON tasks.user_id = user_accounts.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).send({ message: "Error fetching tasks" });
    }

    // Decrypt all fields before filtering
    const toReviewTasks = results
      .map((task) => {
        let decryptedTask = {};
        try {
          decryptedTask = {
            id: task.id,
            title: decrypt(task.title),
            description: decrypt(task.description),
            status: decrypt(task.status),
            due_date: decrypt(task.due_date),
            firstName: decrypt(task.first_name),
            lastName: decrypt(task.last_name),
          };
        } catch (error) {
          console.error("Error decrypting task data:", error);
          return null; // Skip if decryption fails
        }

        return decryptedTask;
      })
      .filter((task) => task && task.status === "To Review"); // Filter only "To Review" tasks

    res.status(200).send(toReviewTasks);
  });
});


// Update task status
app.put("/api/update-task-status", (req, res) => {
  const { taskId, status } = req.body;

  if (!taskId || !status) {
    return res.status(400).send({ message: "taskId and status are required" });
  }
  const encStatus = encrypt(status);
  const query = "UPDATE tasks SET status = ? WHERE id = ?";

  db.query(query, [encStatus, taskId], (err, results) => {
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
      tasks.status,
      COUNT(tasks.id) AS total_tasks,
      SUM(CASE WHEN tasks.status = ? THEN 1 ELSE 0 END) AS completed_tasks
    FROM user_accounts
    LEFT JOIN tasks ON user_accounts.id = tasks.user_id
    GROUP BY user_accounts.id;
  `;

  db.query(query, ["Encrypted_Completed"], (err, results) => {
    if (err) {
      console.error("Error fetching task stats:", err);
      return res.status(500).send({ message: "Error fetching task stats" });
    }

    // Transform and decrypt status
    const taskStats = results.map((row) => {
      let decryptedStatus = "Unknown";
      try {
        decryptedStatus = decrypt(row.status); // Decrypt status
      } catch (error) {
        console.error("Error decrypting status:", error);
      }

      return {
        userId: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        completed: decryptedStatus === "Completed" ? row.completed_tasks || 0 : 0,
        total: row.total_tasks || 0,
      };
    });

    res.status(200).send(taskStats);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
