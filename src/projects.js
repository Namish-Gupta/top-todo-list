import makeTodo from "./todo";

function addTodoToProject(id, todo) {
    const targetProject = projects.find(proj => proj.id === id);
    console.log(`Todo ${todo.id} added!`);
    if(targetProject)
    {
        targetProject.todolist.push(todo);
        saveToStorage();
        return targetProject;
    }
    console.log('Project not found!');
}

function deleteTodoFromProject(projectId, todoId) {
    const targetProject = projects.find(proj => proj.id === projectId);
    if(targetProject)
    {
        const targetTodo = targetProject.todolist.find(todo => String(todo.id) === String(todoId));
        const index = targetProject.todolist.indexOf(targetTodo);
        if(index !== -1)
        {
            targetProject.todolist.splice(index, 1);
            saveToStorage();
        }
        else console.log('Todo not found!');
        return targetProject;
    }
    console.log('Project not found!');
}

function addProject(name) {
    const proj = {name: name, id: Date.now(), todolist: []};
    console.log(`Project ${proj.id} added!`);
    projects.push(proj);
    saveToStorage();
    return proj;
}

function deleteProject(id) {
    const target = projects.findIndex(proj => proj.id === id);
    if(target !== -1)
    {
        projects.splice(target, 1);
        saveToStorage();
    }
    else console.log('Project not found!');
}

function editTodoInProject(projectId, todoId, updatedData) {
    const targetProject = projects.find(proj => proj.id === projectId);
    
    if (targetProject) {
        const targetTodo = targetProject.todolist.find(todo => String(todo.id) === String(todoId));
        
        if (targetTodo) {
            // Update the properties of the found object in place
            targetTodo.title = updatedData.title;
            targetTodo.description = updatedData.description;
            targetTodo.dueDate = updatedData.dueDate;
            targetTodo.priority = updatedData.priority;
            targetTodo.notes = updatedData.notes;
            saveToStorage();
        } else {
            console.log('Todo not found for editing!');
        }
    } else {
        console.log('Project not found!');
    }
}

function toggleTodoCompletion(projectId, todoId) {
    const targetProject = projects.find(proj => proj.id === projectId);
    
    if (targetProject) {
        const targetTodo = targetProject.todolist.find(todo => todo.id === todoId);
        
        if (targetTodo) {
            // Invert the current boolean value (true becomes false, false becomes true)
            targetTodo.isComplete = !targetTodo.isComplete;
            saveToStorage();
        }
    }
}

function saveToStorage() {
    // Converts the JavaScript array into a JSON string and saves it
    localStorage.setItem('odin-todo-data', JSON.stringify(projects));
}

function loadFromStorage() {
    const storedData = localStorage.getItem('odin-todo-data');
    if (storedData) {
        return JSON.parse(storedData);
    }
    // First-time visitor fallback: Provide default state
    return [
        {
            id: Date.now(),
            name: 'Restaurant',
            todolist: [
                makeTodo('Groceries', 'Buy vegetables', `2027-06-01`, 1, 'This task will initialize cooking of the day')
            ]
        }
    ];
}

const projects = loadFromStorage();

export {addTodoToProject, deleteTodoFromProject, addProject, deleteProject, projects, editTodoInProject, toggleTodoCompletion};