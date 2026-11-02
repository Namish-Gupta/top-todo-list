import { projects } from './projects.js';
import './style.css';
import {
    initTaskModal, 
    bindFormEvents, 
    bindProjectEvents, 
    bindTodoEvents, 
    bindAddProjectEvent, 
    renderProjects, 
    renderTodos, 
    setActiveProjectId, 
    initLayout
} from './domController.js';

initTaskModal();
initLayout();

bindFormEvents();
bindProjectEvents();
bindTodoEvents();
bindAddProjectEvent();

if(projects.length > 0)
{
    const initialProjectId = projects[0].id;
    setActiveProjectId(initialProjectId);
    renderProjects();
    renderTodos(initialProjectId);
}
else renderProjects();