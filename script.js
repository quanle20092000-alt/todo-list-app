// Todo List Application with Local Storage
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todoList_data';
        
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.render();
    }

    // Initialize DOM elements
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyMessage = document.getElementById('emptyMessage');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    // Attach event listeners
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    // Add a new todo
    addTodo() {
        const text = this.todoInput.value.trim();

        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToStorage();
        this.render();
    }

    // Delete a todo
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }
        
        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToStorage();
            this.render();
        }
    }

    // Clear all todos
    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Delete all tasks? This cannot be undone!')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    // Filter todos based on current filter
    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'pending':
                return this.todos.filter(t => !t.completed);
            default:
                return this.todos;
        }
    }

    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }

    // Render todos to DOM
    render() {
        const filtered = this.getFilteredTodos();
        
        // Clear existing list
        this.todoList.innerHTML = '';

        // Show empty message if no todos
        if (filtered.length === 0) {
            this.emptyMessage.style.display = 'block';
        } else {
            this.emptyMessage.style.display = 'none';
            
            // Create todo items
            filtered.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox"
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="todo-date">${todo.createdAt}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                `;
                
                this.todoList.appendChild(li);
            });
        }

        // Update stats
        this.updateStats();

        // Update button states
        this.clearCompletedBtn.disabled = this.todos.filter(t => t.completed).length === 0;
        this.clearAllBtn.disabled = this.todos.length === 0;
    }

    // Save todos to Local Storage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
            console.log('✅ Data saved to Local Storage:', this.todos);
        } catch (error) {
            console.error('❌ Error saving to Local Storage:', error);
        }
    }

    // Load todos from Local Storage
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.todos = JSON.parse(data);
                console.log('✅ Data loaded from Local Storage:', this.todos);
            } else {
                console.log('ℹ️ No data found in Local Storage');
                this.todos = [];
            }
        } catch (error) {
            console.error('❌ Error loading from Local Storage:', error);
            this.todos = [];
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export todos as JSON
    exportData() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        console.log('✅ Data exported');
    }

    // Import todos from JSON
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.todos = imported;
                this.saveToStorage();
                this.render();
                console.log('✅ Data imported');
            } else {
                throw new Error('Invalid format');
            }
        } catch (error) {
            console.error('❌ Error importing data:', error);
            alert('Invalid JSON format!');
        }
    }

    // Clear Local Storage
    clearStorage() {
        if (confirm('Clear all data from Local Storage?')) {
            localStorage.removeItem(this.storageKey);
            this.todos = [];
            this.render();
            console.log('✅ Local Storage cleared');
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
    console.log('🚀 Todo App initialized successfully!');
    console.log('💡 Tips:');
    console.log('  - app.exportData() - Export todos as JSON');
    console.log('  - app.importData(jsonString) - Import todos from JSON');
    console.log('  - app.clearStorage() - Clear Local Storage');
    console.log('  - localStorage - View raw Local Storage data');
});