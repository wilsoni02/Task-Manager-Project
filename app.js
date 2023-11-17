// Created by: Ian Wilson
// Date; November 16th, 2023

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./connect');
const Task = require('./Task');
const cors = require('cors');

const corsOptions = {
  origin: "http://localhost:63342",
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.static("./Client"));
app.use(express.json());
(app.use)(express.static("./Client")); // Serve static files

const port = 4000;
const appName = "Task Manager";

// GET route to retrieve all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    console.log('GET /api/tasks called');
    const tasks = await Task.find();
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error retrieving tasks: ", error.message);
    res.status(500).json({ msg: "Error retrieving tasks" });
  }
});

// POST route to create a new task
app.post('/api/tasks', async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body to see what data is being sent
  try {
    const task = await Task.create(req.body);
    io.emit('tasks', await Task.find());
    console.log('Task Created:', task); // Log the created task
    res.status(201).json({ task });
  } catch (error) {
    console.error("Error creating a task:", error);
    res.status(500).json({ msg: "Error creating a task" });
  }
});

// DELETE route to delete a task by ID
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    io.emit('tasks', await Task.find());
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(200).json({ msg: "Task deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting task" });
  }
});

// PUT route to update a task by ID
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    io.emit('tasks', await Task.find()); // Emit the updated tasks
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ msg: "Error updating task" });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Emit tasks after a new task is created
  socket.on('newTask', async () => {
    const tasks = await Task.find();
    io.emit('tasks', tasks);
  });

  // Emit tasks after a task is deleted
  socket.on('deleteTask', async () => {
    const tasks = await Task.find();
    io.emit('tasks', tasks);
  });
});

const start = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log(`${appName} is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

start();
