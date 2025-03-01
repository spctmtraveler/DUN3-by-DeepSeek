let tasks = [];
let selectedTaskId = null;

// ========== Enhanced Sorting Logic ==========
function prioritySort(a, b) {
    const priorities = ['Fast', 'First', 'Fire', 'Fear', 'Flow'];
    for (let attr of priorities) {
        if (a[attr] !== b[attr]) {
            return (b[attr] || 0) - (a[attr] || 0);
        }
    }
    return a.order - b.order;
}

// ========== Enhanced Task Model ==========
function createTask(title) {
    return {
        id: Date.now(),
        title,
        section: 'Triage',
        parentId: null,
        order: tasks.length,
        Fast: 0,
        First: 0,
        Fire: 0,
        Fear: 0,
        Flow: 0,
        completed: false // Added completed property
    };
}

// ========== Calculate Nesting Level ==========
function calculateNestingLevel(task) {
    let level = 0;
    let currentTask = task;
    while (currentTask.parentId) {
        level++;
        currentTask = tasks.find(t => t.id === currentTask.parentId);
    }
    return level;
}

// ========== Corrected Panel Toggle Logic ==========
document.querySelectorAll('.panel-toggles i').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const panelId = icon.dataset.panel;
        const panel = document.getElementById(panelId);

        // Toggle panel visibility
        panel.classList.toggle('hidden');
        // Toggle icon active state
        icon.classList.toggle('active');
    });
});

// ========== Handle Task Click ==========
function handleTaskClick(taskElement, task) {
    selectedTaskId = task.id;
    showTaskDetails(task);

    // Open Task Details panel if not already open
    const taskPanel = document.getElementById('task-panel');
    if (taskPanel.classList.contains('hidden')) {
        taskPanel.classList.remove('hidden');
        document.querySelector('[data-panel="task-panel"]').classList.add('active');
    }
}

// ========== Enhanced Task Details ==========
function showTaskDetails(task) {
    if (!task) return;
    
    const detailsPanel = document.getElementById('task-panel');
    const validAttributes = ['Fast', 'First', 'Fire', 'Fear', 'Flow'];
    
    detailsPanel.innerHTML = `
        <h2>Task Details</h2>
        <div class="task-details">
            <input type="text" class="task-title-edit" value="${task.title || ''}" />
            <div class="priority-attributes">
                ${validAttributes.map(key => `
                    <div class="attribute-control">
                        <label>${key}</label>
                        <input type="number" value="${task[key] || 0}" 
                               data-attr="${key}" 
                               onchange="updateTaskAttribute(${task.id}, '${key}', this.value)" />
                    </div>`
                ).join('')}
            </div>
            <button onclick="saveTaskChanges(${task.id})">Save Changes</button>
        </div>
    `;
}

// ========== Task Management Functions ==========
function updateTaskAttribute(taskId, attribute, value) {
    const task = tasks.find(t => t.id === taskId);
    if (task) task[attribute] = Number(value);
}

function saveTaskChanges(taskId) {
    const newTitle = document.querySelector('.task-title-edit').value;
    tasks = tasks.map(t => t.id === taskId ? {...t, title: newTitle} : t);
    renderTasks();
}


function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) task.completed = !task.completed;
    renderTasks();
}

// ========== Updated Render Function ==========
function renderTasks() {
    if (!Array.isArray(tasks)) {
        tasks = [];
        return;
    }

    // Clear all task lists
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    // Create a map of sections
    const sectionMap = {};
    document.querySelectorAll('.task-section').forEach(section => {
        const header = section.querySelector('h3');
        if (header) {
            const sectionName = header.textContent;
            const taskList = section.querySelector('.task-list');
            if (sectionName && taskList) {
                sectionMap[sectionName] = taskList;
            }
        }
    });

    // Ensure Triage section exists
    if (!sectionMap['Triage']) {
        console.warn('Triage section not found');
        return;
    }

    // Render each task
    tasks.forEach(task => {
        if (!task || typeof task !== 'object') return;
        if (!task.title || typeof task.title !== 'string') return;

        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.textContent = task.title;
        
        // Set nesting level
        if (typeof calculateNestingLevel === 'function') {
            const level = calculateNestingLevel(task);
            if (level > 0) {
                taskElement.dataset.nestingLevel = level;
            }
        }

        // Add actions and click handler
        if (typeof addTaskActions === 'function') {
            addTaskActions(taskElement, task);
        }
        
        taskElement.addEventListener('click', () => {
            if (typeof handleTaskClick === 'function') {
                handleTaskClick(taskElement, task);
            }
        });

        // Add to appropriate section
        const section = task.section || 'Triage';
        const targetList = sectionMap[section];
        if (targetList) {
            targetList.appendChild(taskElement);
        } else {
            sectionMap['Triage'].appendChild(taskElement);
        }
    });
}

// ========== Enhanced Sorting Implementation ==========
document.getElementById('sort-btn').addEventListener('click', () => {
    const sections = ['Triage', 'A', 'B', 'C'];
    tasks = sections.flatMap(section => 
        tasks.filter(t => t.section === section)
            .sort(prioritySort)
    );

    document.querySelectorAll('.attribute-box').forEach(b => b.style.visibility = 'hidden');
    renderTasks();
});

function highlightTask(element, task) {
    document.querySelectorAll('.selected-task').forEach(t => t.classList.remove('selected-task'));
    element.classList.add('selected-task');
    document.querySelector(`[data-panel="reflect-panel"]`).click();
}

function addTaskActions(taskElement, task) {
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Completion Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTaskComplete(task.id);
    actions.appendChild(checkbox);

    taskElement.appendChild(actions);
}


// Initialize with sample tasks
tasks = [
    createTask('Triage Task'),
    createTask('Mail-check'),
    createTask('Sample Task A'),
    createTask('Sample Task B'),
    createTask('Sample Task C')
];
renderTasks();