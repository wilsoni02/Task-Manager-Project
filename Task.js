const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Must provide a task name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"]
  },
  completed: {
    type: Boolean,
    default: false
  }
  // Include other fields if needed based on your project requirements
}, { timestamps: true }); // Add timestamps to each task

module.exports = mongoose.model("Task", TaskSchema);
