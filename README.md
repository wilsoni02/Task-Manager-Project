# Task Manager App

This is a simple real-time Task Manager application that allows you to add, edit, delete, and mark tasks as done. It is built using Node.js, Express, MongoDB (via Mongoose), Socket.io, and vanilla JavaScript for the front end.

---

## Setup Instructions

1. **Install Node.js**
    - Download and install Node.js from [nodejs.org](https://nodejs.org).

2. **Clone or Download the Project**
    - Ensure all project files are arranged as shown in the Project Structure above.

3. **Install Dependencies**
    - Open a terminal in the project root directory (where `app.js` is located).
    - Run the following command to install all necessary dependencies:
      ```
      npm install express socket.io mongoose cors dotenv
      ```

4. **Configure MongoDB Connection**
    - The project uses MongoDB to store tasks. The connection string is defined in `connect.js`.
    - **Important:** The current MongoDB URI in the code is no longer in service. Create a `.env` file in the project root and add your own MongoDB connection string:
      ```
      MONGODB_URI=your_mongodb_connection_string_here
      ```
    - Replace `your_mongodb_connection_string_here` with your actual MongoDB URI (for example, from MongoDB Atlas).

5. **Start the Server**
    - In the terminal, run:
      ```
      node app.js
      ```
    - The server will start on port 4000. You should see messages similar to:
      ```
      MongoDB Connected...
      Task Manager is listening on port 4000
      ```

6. **Access the Application**
    - Open your web browser and navigate to [http://localhost:4000](http://localhost:4000) to view the Task Manager interface.

---

## How to Use the App

- **Adding a Task:**
    - Enter a task name in the input box on the main page and click the **Add Task** button.
    - The new task will appear in the list and be saved to the database.

- **Editing a Task:**
    - Click the **Edit** button next to a task to change its name.
    - When you finish editing (press Enter or click outside), the change will be saved.

- **Deleting a Task:**
    - Click the **Delete** button next to a task.
    - Confirm the deletion when prompted. The task will be removed from the list and the database.

- **Marking a Task as Done:**
    - Click the **Done** button next to a task.
    - The task will be marked as completed (typically indicated by a strikethrough and color change).

- **Real-Time Updates:**
    - The app uses Socket.io to push real-time updates to all connected clients.
    - When a task is added, edited, or deleted, the changes are automatically updated on the page.

---

## Troubleshooting

- **MongoDB Connection:**
    - If you experience issues connecting to MongoDB, double-check that your `.env` file contains the correct `MONGODB_URI` and that your MongoDB cluster is active.

- **Dependencies:**
    - Ensure that all dependencies are installed correctly by running `npm install`.

- **Server Errors:**
    - Check your terminal for error messages when running `node app.js` and review the browser console for any client-side errors.

---

## License

This project was created by Ian Wilson on November 16th, 2023.

---

Enjoy using the Task Manager App and feel free to modify it to suit your needs!


