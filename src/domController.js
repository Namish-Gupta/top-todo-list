import { deleteTodoFromProject, projects, addProject, deleteProject, addTodoToProject, editTodoInProject } from "./projects";
import makeTodo from "./todo";
import { format, parseISO, isValid } from 'date-fns';

function initTaskModal() {
    const content = document.getElementById('content');
    
    const dialog = document.createElement('dialog');
    dialog.id = 'task-modal';
    
    const form = document.createElement('form');
    form.id = 'task-form';
    
    // Add a hidden input to track if we are editing an existing task.
    // If it's empty, we are creating a new task. If it has an ID, we are editing.
    const hiddenIdInput = document.createElement('input');
    hiddenIdInput.type = 'hidden';
    hiddenIdInput.id = 'form-todo-id';

    // Title Input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'title-input';
    titleInput.required = true;
    titleInput.placeholder = 'Task Title';

    // Description Input
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'desc-input';
    descInput.placeholder = 'Description';

    // Due Date Input
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'date-input';
    dateInput.required = true;

    // Priority Dropdown (Matches the 1, 2, 3 values from your render logic)
    const prioritySelect = document.createElement('select');
    prioritySelect.id = 'priority-select';
    
    const p1 = document.createElement('option'); p1.value = '1'; p1.textContent = 'Low';
    const p2 = document.createElement('option'); p2.value = '2'; p2.textContent = 'Medium';
    const p3 = document.createElement('option'); p3.value = '3'; p3.textContent = 'High';
    prioritySelect.append(p1, p2, p3);

    // Notes Textarea
    const notesInput = document.createElement('textarea');
    notesInput.id = 'notes-input';
    notesInput.placeholder = 'Additional notes...';

    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Save Task';

    // Cancel Button - Must be type 'button' so it doesn't trigger form submission
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button'; 
    cancelBtn.id = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';

    // Append everything to the form, then dialog, then the DOM
    form.append(
        hiddenIdInput, 
        titleInput, 
        descInput, 
        dateInput, 
        prioritySelect, 
        notesInput, 
        submitBtn, 
        cancelBtn
    );
    dialog.appendChild(form);
    content.appendChild(dialog);
}

function bindFormEvents() {
    const dialog = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const cancelBtn = document.getElementById('cancel-btn');

    cancelBtn.addEventListener('click', () => {
        dialog.close();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const todoId = form.querySelector('#form-todo-id').value;
        const title = form.querySelector('#title-input').value;
        const desc = form.querySelector('#desc-input').value;
        const date = form.querySelector('#date-input').value;
        
        // Parse priority back into an integer
        const priority = parseInt(form.querySelector('#priority-select').value, 10);
        const notes = form.querySelector('#notes-input').value;

        // Route data based on whether an ID exists in the hidden input
        if (todoId === '') {
            // No ID = Create New Task
            const newTodo = makeTodo(title, desc, date, priority, notes);
            addTodoToProject(activeProjectId, newTodo);
        } else {
            // Existing ID = Edit Existing Task
            editTodoInProject(activeProjectId, todoId, { 
                title, description: desc, dueDate: date, priority, notes 
            });
        }

        // Close the dialog and repaint the UI to reflect changes
        dialog.close();
        renderTodos(activeProjectId); 
    });
}

function openTaskForm(todoData = null) {
    const dialog = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    
    if (todoData) {
        // EDIT MODE: Populate the inputs with the existing data
        form.querySelector('#form-todo-id').value = todoData.id;
        form.querySelector('#title-input').value = todoData.title;
        form.querySelector('#desc-input').value = todoData.description;
        form.querySelector('#date-input').value = todoData.dueDate;
        form.querySelector('#priority-select').value = todoData.priority;
        form.querySelector('#notes-input').value = todoData.notes;
    } else {
        // ADD MODE: Wipe the form clean for a new entry
        form.reset(); 
        form.querySelector('#form-todo-id').value = ''; 
    }
    
    dialog.showModal(); // HTML5 method that instantly opens the dialog as an overlay
}

let activeProjectId = null;

function bindTodoEvents() {
    const todosContainer = document.getElementById('todos-container');

    todosContainer.addEventListener('click', e => {
        const clicked = e.target;

        const card = clicked.closest('.card');
        if(!card) return;

        const todoId = card.dataset.todoId;

        if(clicked.classList.contains('delete-btn'))
        {
            deleteTodoFromProject(activeProjectId, todoId);
            renderTodos(activeProjectId);
        }
        else if(clicked.classList.contains('expand-btn'))
        {
            const notes = card.querySelector('.notes');
            console.log('Expand got clicked');
            if(clicked.dataset.expanded === 'false')
            {
                clicked.dataset.expanded = 'true';
                notes.style.display = 'block';
                clicked.textContent = 'Collapse';
            }
            else
            {
                clicked.dataset.expanded = 'false';
                notes.style.display = 'none';
                clicked.textContent = 'Expand';
            }
        }
        else if(clicked.classList.contains('edit-btn'))
        {
            const targetProject = projects.find(proj => proj.id === activeProjectId);
            const targetTodo = targetProject.todolist.find(todo => todo.id === todoId);
            console.log(targetTodo);
            openTaskForm(targetTodo);
        }
        else if (clicked.classList.contains('complete-checkbox')) {
            toggleTodoCompletion(activeProjectId, todoId);
            renderTodos(activeProjectId);
        }
    })
}

function clearProjects() {
    const projectList = document.getElementById('project-list');
    if (projectList) {
        projectList.innerHTML = '';
    }
}

function clearTodos() {
    const todolistContainer = document.getElementById('todos-container');
    todolistContainer.innerHTML = '';
}

function renderProjects() {
    clearProjects();
    const projectContainer = document.getElementById('project-list');
    projects.forEach(proj => {
        // Create the main container for a single project item
        const projItem = document.createElement('div');
        projItem.classList.add('project-item');
        
        // Attach the unique ID to the DOM element for event delegation.
        // This renders as <div data-project-id="1698...">
        projItem.dataset.projectId = proj.id; 

        // Visually indicate if this is the currently active project
        if (proj.id === activeProjectId) {
            projItem.classList.add('active');
        }

        // Create the text element for the project's name
        const title = document.createElement('span');
        title.textContent = proj.name;
        title.classList.add('project-title');

        // Create the delete button specifically for this project
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.classList.add('delete-project-btn');

        // Append the title and button to the project item, then append to the sidebar
        projItem.append(title, delBtn);
        projectContainer.appendChild(projItem);
    });
}

function renderTodos(id) {
    clearTodos();
    activeProjectId = id;
    const todolistContainer = document.getElementById('todos-container');

    const targetProject = projects.find(proj => proj.id === id);
    if(!targetProject)
    {
        console.error('Project not found!');
        return;
    }

    const addTaskBtn = document.createElement('button');
    addTaskBtn.textContent = '+ Add New Task';
    addTaskBtn.addEventListener('click', () => { openTaskForm(null); });
    addTaskBtn.classList.add('add-task-btn');

    addTaskBtn.addEventListener('click', () => {
        openTaskForm(null); 
    });

    todolistContainer.appendChild(addTaskBtn);

    const sortedTodos = [...targetProject.todolist].sort((a, b) => b.priority - a.priority);
    sortedTodos.forEach(todo => {
        const todoCard = document.createElement('div');
        todoCard.classList.add('card');

        todoCard.dataset.todoId = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('complete-checkbox');
        checkbox.checked = todo.isComplete;
        if (todo.isComplete) todoCard.classList.add('completed-task');

        const headline = document.createElement('h2');
        headline.textContent = todo.title;

        const checkContainer = document.createElement('div');
        checkContainer.className = 'check-container';
        const desc = document.createElement('p');
        desc.textContent = todo.description;
        const date = document.createElement('p');
        date.classList.add('due-date');

        if (todo.dueDate) {
            const parsedDate = parseISO(todo.dueDate);
            
            // Check if the parser successfully created a real date
            if (isValid(parsedDate)) {
                date.textContent = format(parsedDate, 'MMM d, yyyy');
            } else {
                // Fallback: just display the raw string to prevent crashes
                date.textContent = todo.dueDate || 'No due date'; 
            }
        } 
        else {
            date.textContent = 'No due date';
        }

        const pr = document.createElement('span');
        if(todo.priority === 1)
        {
            pr.textContent = 'Low';
            pr.className = 'low';
        }
        else if(todo.priority === 2)
        {
            pr.textContent = 'Medium';
            pr.className = 'med';
        }
        else
        {
            pr.textContent = 'High';
            pr.className = 'high';
        }
        const notes = document.createElement('p');
        notes.classList.add('notes');
        notes.textContent = todo.notes;
        notes.style.display = 'none';

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');

        const expandBtn = document.createElement('button');
        expandBtn.classList.add('expand-btn');
        expandBtn.textContent = 'Expand';
        expandBtn.dataset.expanded = false;

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';

        actionButtons.append(expandBtn, editBtn, deleteBtn);

        checkContainer.appendChild(checkbox);
        checkContainer.appendChild(headline);
        todoCard.appendChild(checkContainer);
        todoCard.appendChild(desc);
        todoCard.appendChild(date);
        todoCard.appendChild(pr);
        todoCard.appendChild(notes);
        todoCard.appendChild(actionButtons);

        todolistContainer.appendChild(todoCard);
    })
}

function bindProjectEvents() {
    const projectContainer = document.querySelector('.project-sidebar');

    projectContainer.addEventListener('click', (e) => {
        const clickedElement = e.target;

        // Traverse up the DOM to find the parent project item container.
        // If the user clicks empty space in the sidebar, we exit the function.
        const projectItem = clickedElement.closest('.project-item');
        if (!projectItem) return;

        // Retrieve the ID from the dataset and parse it back into an integer.
        // This is crucial because dataset values are always strings, but Date.now() is a number.
        const projectId = parseInt(projectItem.dataset.projectId, 10);

        // Branch 1: The user clicked the delete button (X)
        if (clickedElement.classList.contains('delete-project-btn')) {
            // Remove the project from the data array
            deleteProject(projectId);

            // Edge Case: If the user deletes the project they are currently viewing,
            // we must reset the activeProjectId to avoid displaying orphaned tasks.
            // We default to the first project in the array, or null if the array is empty.
            if (activeProjectId === projectId) {
                activeProjectId = projects.length > 0 ? projects[0].id : null;
            }

            // Re-render both areas to reflect the deleted project and the new active state
            renderProjects();
            
            if (activeProjectId) {
                renderTodos(activeProjectId);
            } else {
                // If there are no projects left, wipe the main task area clean
                clearTodos(); 
            }
        } 
        // Branch 2: The user clicked anywhere else on the project item (switching projects)
        else {
            // Update the state tracker to the clicked project's ID
            activeProjectId = projectId;
            
            // Re-render the sidebar to move the '.active' highlight class
            renderProjects();
            
            // Render the tasks belonging to the newly selected project
            renderTodos(activeProjectId);
        }
    });
}

function bindAddProjectEvent() {
    const addProjectBtn = document.getElementById('add-project-btn');

    addProjectBtn.addEventListener('click', () => {
        // Prompt the user for a new project name
        const projectName = prompt('Enter a name for your new project:');

        // Validate that the user actually typed something and didn't hit cancel
        if (projectName && projectName.trim() !== '') {
            // Add the project to the data array using your logic function
            // The addProject() function should return the newly created project object
            const newProject = addProject(projectName.trim());

            // Automatically switch the user's view to the newly created project
            activeProjectId = newProject.id;

            // Re-render the UI to show the new project in the sidebar and an empty task list
            renderProjects();
            renderTodos(activeProjectId);
        }
    });
}

function setActiveProjectId(id) {
    activeProjectId = id;
}

function initLayout() {
    const content = document.getElementById('content');
    
    // 1. Create the Sidebar
    const sidebar = document.createElement('div');
    sidebar.classList.add('project-sidebar');
    
    // Create the "+ Add Project" button and put it in the sidebar
    const addProjectBtn = document.createElement('button');
    addProjectBtn.id = 'add-project-btn';
    addProjectBtn.textContent = '+ Add Project';
    sidebar.appendChild(addProjectBtn);

    const projectList = document.createElement('div');
    projectList.id = 'project-list';
    sidebar.appendChild(projectList);

    // 2. Create the Main Task Area
    const todosContainer = document.createElement('div');
    todosContainer.id = 'todos-container';

    // 3. Append both to the main content div
    content.appendChild(sidebar);
    content.appendChild(todosContainer);
}

function toggleTodoCompletion(projectId, todoId) {
    const targetProject = projects.find(proj => proj.id === projectId);
    
    if (targetProject) {
        // Use find() because we want to modify the actual object reference, 
        // not just find its index.
        const targetTodo = targetProject.todolist.find(todo => String(todo.id) === String(todoId));
        
        if (targetTodo) {
            // Invert the current boolean value (true becomes false, false becomes true)
            targetTodo.isComplete = !targetTodo.isComplete;
            
            // Optional: return the new state if your DOM controller ever needs to read it directly
            return targetTodo.isComplete; 
        } else {
            console.error('Todo not found for toggling!');
        }
    } else {
        console.error('Project not found!');
    }
}

export { initLayout, renderProjects, renderTodos, bindProjectEvents, bindTodoEvents, bindAddProjectEvent, initTaskModal, bindFormEvents, setActiveProjectId };