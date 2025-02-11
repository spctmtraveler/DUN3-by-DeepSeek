
let tasks = [];

document.querySelector('.accent-btn').addEventListener('click', addTask);
document.querySelector('input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const input = document.querySelector('input');
    if (!input.value.trim()) return;

    const newTask = {
        id: Date.now(),
        title: input.value,
        section: 'Triage',
        parentId: null,
        order: tasks.length
    };
    tasks.push(newTask);
    input.value = '';
    renderTasks();
}

function addTaskActions(taskElement, task) {
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.className = 'icon-btn';
    playBtn.onclick = () => highlightTask(taskElement, task);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.className = 'icon-btn';
    deleteBtn.onclick = () => confirmDelete(task.id);
    
    actions.append(playBtn, deleteBtn);
    taskElement.append(actions);
}

function highlightTask(element, task) {
    document.querySelectorAll('.selected-task').forEach(t => t.classList.remove('selected-task'));
    element.classList.add('selected-task');
}

function confirmDelete(taskId) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
    }
}

function calculateNestingLevel(task) {
    let level = 0;
    let currentTask = task;
    while (currentTask.parentId) {
        level++;
        currentTask = tasks.find(t => t.id === currentTask.parentId);
    }
    return level;
}

function renderTasks() {
    const sections = document.querySelectorAll('.task-section .task-list');
    sections.forEach(section => {
        section.innerHTML = '';
    });
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.textContent = task.title;
        taskElement.dataset.nestingLevel = calculateNestingLevel(task);
        addTaskActions(taskElement, task);
        
        const section = document.querySelector(`.task-section:has(h3:contains('${task.section}')) .task-list`);
        if (section) {
            section.appendChild(taskElement);
        }
    });
}

document.getElementById('sort-btn')?.addEventListener('click', () => {
    tasks.sort((a, b) => a.order - b.order);
    document.querySelectorAll('.attribute-box').forEach(box => box.style.visibility = 'hidden');
    renderTasks();
});

// Panel Toggle Logic
document.querySelectorAll('.panel-toggles i').forEach(icon => {
    icon.addEventListener('click', () => {
        // Toggle active state for clicked icon
        icon.classList.toggle('active');

        // Get target panel
        const panelId = icon.dataset.panel;
        const panel = document.getElementById(panelId);

        // Toggle panel visibility
        panel.classList.toggle('hidden');
    });
});

// Tasks panel is visible by default, no need for initial activation
