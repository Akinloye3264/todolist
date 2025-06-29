// Smart To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = [];
        // Auto-detect API base URL - works on any domain
        this.apiBase = window.location.origin;
        this.initializeElements();
        this.loadTasks();
        this.setupEventListeners();
        this.updateTaskCount();
        
        // Check backend status on startup
        this.checkBackendStatus();
    }

    initializeElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskReminderInput = document.getElementById('taskReminder');
        this.taskEmailInput = document.getElementById('taskEmail');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.successToast = document.getElementById('successToast');
        this.errorToast = document.getElementById('errorToast');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.currentTimeDisplay = document.getElementById('currentTimeDisplay');
    }

    setupEventListeners() {
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Set default reminder time to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        this.taskReminderInput.value = tomorrow.toISOString().slice(0, 16);
        // Auto-fill with current device time on focus
        this.taskReminderInput.addEventListener('focus', () => {
            const now = new Date();
            // Format for datetime-local: yyyy-MM-ddTHH:mm
            const pad = n => n < 10 ? '0' + n : n;
            const formatted = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
            this.taskReminderInput.value = formatted;
        });
        // Start current time updater
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    updateCurrentTime() {
        if (this.currentTimeDisplay) {
            const now = new Date();
            this.currentTimeDisplay.textContent = this.formatAMPM(now);
        }
    }

    formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        seconds = seconds < 10 ? '0'+seconds : seconds;
        let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        return (
            (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() + ', ' + strTime
        );
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.renderTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateTaskCount();
    }

    updateTaskCount() {
        this.taskCount.textContent = this.tasks.length;
    }

    async handleAddTask(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const taskReminder = this.taskReminderInput.value;
        const taskEmail = this.taskEmailInput.value.trim();

        if (!taskText) {
            this.showError('Please enter a task description');
            return;
        }
        if (!taskReminder) {
            this.showError('Please set a reminder time');
            return;
        }
        if (!taskEmail) {
            this.showError('Please enter your email address');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            reminder: taskReminder,
            email: taskEmail,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add task to list
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();

        // Clear form
        this.taskForm.reset();
        
        // Set default reminder time again
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        this.taskReminderInput.value = tomorrow.toISOString().slice(0, 16);

        // Send reminder email
        await this.sendReminderEmail(task);
    }

    async sendReminderEmail(task) {
        this.showLoading();
        
        const taskText = task.text || 'Untitled Task';
        
        try {
            const response = await fetch(`${this.apiBase}/send-reminder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task: taskText,
                    email: task.email,
                    reminderTime: task.reminder
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (data.localOnly) {
                    this.showSuccess('Task saved successfully!');
                } else {
                    this.showSuccess('Task saved successfully and we will send an email to you!');
                }
            } else {
                this.showSuccess('Task saved successfully!');
            }
        } catch (error) {
            console.error('Network error:', error);
            this.showSuccess('Task saved successfully!');
        } finally {
            this.hideLoading();
        }
    }

    async addToCalendar() {
        const task = {
            text: this.taskInput.value.trim(),
            reminder: this.taskReminderInput.value,
            email: this.taskEmailInput.value.trim()
        };

        if (!task.text || !task.reminder || !task.email) {
            this.showError('Please fill in all fields first');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBase}/add-to-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });

            const data = await response.json();
            
            if (data.success) {
                if (data.localOnly) {
                    this.showSuccess('Task saved successfully!');
                } else {
                    this.showSuccess('Task saved successfully and calendar event sent to your email!');
                }
            } else {
                this.showSuccess('Task saved successfully!');
            }
        } catch (error) {
            console.error('Network error:', error);
            this.showSuccess('Task saved successfully!');
        } finally {
            this.hideLoading();
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) li.classList.add('done');
        const taskText = task.text || 'Untitled Task';
        let reminderDate = null;
        try {
            reminderDate = new Date(task.reminder);
        } catch (error) {
            console.error('Error parsing reminder date:', error);
        }
        li.innerHTML = `
            <div class="task-content">
                <div class="task-text">${taskText}</div>
                <div class="task-meta">
                    <div><i class="far fa-clock"></i> ${reminderDate ? this.formatAMPM(reminderDate) : ''}</div>
                    <div><i class="far fa-envelope"></i> ${task.email}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn btn-done" onclick="todoApp.toggleTask(${task.id})">
                    <i class="fas fa-check"></i>
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <button class="task-btn btn-calendar" onclick="todoApp.sendCalendarEvent(${task.id})">
                    <i class="fas fa-calendar-plus"></i>
                    Calendar
                </button>
                <button class="task-btn btn-delete" onclick="todoApp.deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;

        return li;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    async sendCalendarEvent(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            this.showError('Task not found');
            return;
        }

        const taskText = task.text || 'Untitled Task';
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiBase}/add-to-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task: taskText,
                    reminder: task.reminder,
                    email: task.email
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (data.localOnly) {
                    this.showSuccess('Task saved successfully!');
                } else {
                    this.showSuccess('Calendar event sent to your email!');
                }
            } else {
                this.showSuccess('Task saved successfully!');
            }
        } catch (error) {
            console.error('Network error:', error);
            this.showSuccess('Task saved successfully!');
        } finally {
            this.hideLoading();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    deleteAllTasks() {
        if (this.tasks.length === 0) {
            this.showError('No tasks to delete');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.showSuccess('All tasks deleted');
        }
    }

    deleteLastTask() {
        if (this.tasks.length === 0) {
            this.showError('No tasks to delete');
            return;
        }

        this.tasks.pop();
        this.saveTasks();
        this.renderTasks();
        this.showSuccess('Last task deleted');
    }

    // UI Helper Methods
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successToast.classList.remove('hidden');
        setTimeout(() => {
            this.successToast.classList.add('hidden');
        }, 5000);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorToast.classList.remove('hidden');
        setTimeout(() => {
            this.errorToast.classList.add('hidden');
        }, 5000);
    }

    // Add this new method
    async checkBackendStatus() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            if (response.ok) {
                console.log('✅ Backend connected');
            }
        } catch (error) {
            console.log('📝 Running in local mode');
        }
    }
}

// Global functions for HTML onclick handlers
function addToCalendar() {
    todoApp.addToCalendar();
}

function deleteAllTasks() {
    todoApp.deleteAllTasks();
}

function deleteLastTask() {
    todoApp.deleteLastTask();
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
}); 