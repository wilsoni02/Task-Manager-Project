// Created by: Ian Wilson
// Date: November 16th, 2023

const http = new CoreHTTP();
const baseURL = 'http://localhost:4000';
const socket = io(baseURL);

socket.on('tasks', (tasks) => {
    const tasksList = document.getElementById('tasks');
    tasksList.innerHTML = ''; // Clear the list
    tasks.forEach(addTaskToList); // Add all tasks to the list
});

socket.on('updateTask', (updatedTask) => {
    // Find the task in the DOM and update its content
    const taskElement = document.querySelector(`[data-task-id="${updatedTask._id}"]`);
    if (taskElement) {
    }
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

        if (task.completed) {
            taskNameSpan.classList.add('task-completed');
        }

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-button';
        editBtn.onclick = function () { editTask(task._id, taskNameSpan, task.completed); };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-button';
        deleteBtn.onclick = function () {
            const confirmed = confirm("Are you sure you want to delete this?");
            if (confirmed) {
                deleteTask(task._id);
            }
        };

        const doneBtn = document.createElement('button');
        doneBtn.textContent = 'Done';
        doneBtn.className = 'done-button';
        doneBtn.onclick = async function () {
            const success = await markTaskAsDone(task._id, taskNameSpan);
            if (success) {
                taskNameSpan.classList.add('task-completed');
            }
            taskNameSpan.classList.add('animate-done');
            setTimeout(() => taskNameSpan.classList.remove('animate-done'), 1000);
        };

        listItem.appendChild(doneBtn);

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

function editTask(taskId, taskNameSpan, isCompleted) {
    let isEnterPressed = false;
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = taskNameSpan.textContent;
    editInput.className = 'task-edit-input';

    // Replace the span with the input
    taskNameSpan.parentNode.replaceChild(editInput, taskNameSpan);
    editInput.focus();
    editInput.select();

    editInput.addEventListener('blur', async function() {
        if (!isEnterPressed) {
            const success = await saveTask(taskId, editInput.value.trim());
            if (success) {
                taskNameSpan.textContent = editInput.value.trim();
                taskNameSpan.classList.toggle('task-completed', isCompleted);
            }
            // Check if the parent exists before replacing
            if(editInput.parentNode) {
                editInput.parentNode.replaceChild(taskNameSpan, editInput);
            }
        }
    });

    editInput.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            isEnterPressed = true;
            const success = await saveTask(taskId, editInput.value.trim());
            if (success) {
                taskNameSpan.textContent = editInput.value.trim();
                taskNameSpan.classList.toggle('task-completed', isCompleted);
            }
            // Check if the parent exists before replacing
            if(editInput.parentNode) {
                editInput.parentNode.replaceChild(taskNameSpan, editInput);
            }
        }
    });
}


async function markTaskAsDone(taskId, taskNameSpan) {
    try {
        const response = await http.put(`${baseURL}/api/tasks/${taskId}`, { completed: true });
        if (response.message.includes('successful')) {
            taskNameSpan.classList.add('task-completed');
            return true; // Indicate success
        } else {
            console.error('Failed to mark task as done', response);
            return false; // Indicate failure
        }
    } catch (error) {
        console.error('Error:', error);
        return false; // Indicate failure
    }
}

async function saveTask(taskId, newName) {
    try {
        const response = await http.patch(`${baseURL}/api/tasks/${taskId}`, { name: newName });
        if (response.message.includes('successful')) {
            socket.emit('editTask');
            return true; // Indicate success
        } else {
            console.error('Failed to update task', response);
            return false; // Indicate failure
        }
    } catch (error) {
        console.error('Error:', error);
        return false; // Indicate failure
    }
}


document.addEventListener('DOMContentLoaded', function() {
    initializeAddTaskForm();
    loadTasks();
});