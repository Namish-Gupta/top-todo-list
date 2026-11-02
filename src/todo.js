export default function makeTodo(title, description, dueDate, priority, notes) {
    let isComplete = false;
    const id = `todo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {id, title, description, dueDate, priority, notes, isComplete};
}