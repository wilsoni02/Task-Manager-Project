// Created by: Ian Wilson
// Date; November 16th, 2023

const http = new CoreHTTP();
const baseURL = 'http://localhost:4000';
const socket = io(baseURL);

socket.on('tasks', (tasks) => {
    const tasksList = document.getElementById('tasks');
    tasksList.innerHTML = ''; // Clear the list
    tasks.forEach(addTaskToList); // Add all tasks to the list
});

function initializeAddTaskForm() {
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        const addButton = addTaskForm.querySelector('button[type="submit"]');

        addButton.addEventListener('click', async function(e) {
            e.preventDefault(); // Prevent the default form submission behavior
            const taskNameInput = document.getElementById('taskName');
            const taskName = taskNameInput.value.trim();

            if (taskName === '') {
                alert('Task name cannot be empty.'); // Simple validation
                return; // Exit the function if validation fails
            }

            const taskData = { name: taskName, completed: false };

            try {
                const httpResponse = await http.post(`${baseURL}/api/tasks`, taskData);
                if (httpResponse.message.includes('successful')) {
                    // Clear the input after successful task addition
                    taskNameInput.value = '';
                    addTaskToList(httpResponse.data.task);
                    socket.emit('newTask'); // Notify the server of the new task
                } else {
                    console.error('Failed to add task', httpResponse);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    } else {
        console.error("Add task form not found!");
    }
}


// Function to load tasks on page load
async function loadTasks() {
    const tasksList = document.getElementById('tasks');
    tasksList.innerHTML = ''; // Clear the current list

    try {
        const httpResponse = await http.get(baseURL + '/api/tasks');
        if (httpResponse.data && httpResponse.data.tasks) {
            httpResponse.data.tasks.forEach(addTaskToList);
        } else {
            console.error('Tasks not found in the response.');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function addTaskToList(task) {
    const tasksList = document.getElementById('tasks');
    if (tasksList) {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';

        const taskNameSpan = document.createElement('span');
        taskNameSpan.textContent = task.name;
        taskNameSpan.className = 'task-name';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-button';
        editBtn.onclick = function () { editTask(task._id, taskNameSpan); };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-button';
        deleteBtn.onclick = function () { deleteTask(task._id); };

        listItem.appendChild(taskNameSpan);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);
        tasksList.appendChild(listItem);
    } else {
        console.error('Task list element not found.');
    }
}

async function deleteTask(taskId) {
    try {
        const response = await http.delete(`${baseURL}/api/tasks/${taskId}`);
        if (response.message.includes('successful')) {
            socket.emit('deleteTask'); // Emit an event for a deleted task
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


function editTask(taskId, taskNameSpan) {
    let isEnterPressed = false; // Flag to check if enter key was pressed

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = taskNameSpan.textContent;
    editInput.className = 'task-edit-input';

    // Remove existing event listeners if they exist
    editInput.onkeypress = null;
    editInput.onblur = null;

    // Define the event handlers
    function handleKeypress(e) {
        if (e.key === 'Enter') {
            isEnterPressed = true; // Set the flag to true
            saveTask(taskId, editInput.value);
            taskNameSpan.textContent = editInput.value;
            editInput.parentNode.replaceChild(taskNameSpan, editInput);
        }
    }

    function handleBlur() {
        if (!isEnterPressed) { // Only if enter was not pressed
            saveTask(taskId, editInput.value);
            taskNameSpan.textContent = editInput.value;
            editInput.parentNode.replaceChild(taskNameSpan, editInput);
        }
    }

    // Add the event listeners
    editInput.addEventListener('keypress', handleKeypress);
    editInput.addEventListener('blur', handleBlur);

    taskNameSpan.parentNode.replaceChild(editInput, taskNameSpan);
    editInput.focus();
    editInput.select();
}



async function saveTask(taskId, newName) {
    try {
        const response = await http.put(`${baseURL}/api/tasks/${taskId}`, { name: newName });
        if (response.message.includes('successful')) {
            socket.emit('editTask');
        } else {
            console.error('Failed to update task', response);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeAddTaskForm();
    loadTasks();
});