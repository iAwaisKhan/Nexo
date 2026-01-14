import { appData } from './state.js';
import { escapeHTML } from './utils.js';

export function renderTasks(tasksToRender = null) {
    const container = document.getElementById('tasksContainer');
    if (!container) return;

    let tasks = tasksToRender || appData.tasks;
    
    if (!tasksToRender && appData.settings && !appData.settings.showCompleted) {
        tasks = tasks.filter(task => task.status !== 'Done');
    }
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No tasks found. Try adjusting your filters!</p></div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        const safeTitle = escapeHTML(task.title || 'Untitled task');
        const safeDescription = escapeHTML(task.description || '');
        const safePriority = escapeHTML(task.priority || 'Low');
        const safeDueDate = escapeHTML(task.dueDate || 'No due date');
        const safeStatus = escapeHTML(task.status || 'To Do');
        const priorityClass = (task.priority || 'Low').toLowerCase();
        const doneStyle = task.status === 'Done' ? 'text-decoration: line-through; opacity: 0.6;' : '';
        return `
            <div class="card" style="animation: fadeIn 0.6s ease;">
                <div style="display: flex; align-items: flex-start; gap: var(--space-12); margin-bottom: var(--space-12);">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.status === 'Done' ? 'checked' : ''}>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: var(--space-8); ${doneStyle}">${safeTitle}</h3>
                        <p style="color: var(--color-text-secondary); margin-bottom: var(--space-12); font-size: var(--font-size-sm);">${safeDescription}</p>
                        <div style="display: flex; gap: var(--space-8); align-items: center; flex-wrap: wrap;">
                            <span class="priority-badge priority-${priorityClass}">${safePriority}</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);"><i class="fas fa-calendar"></i> ${safeDueDate}</span>
                            <span class="tag" style="font-size: var(--font-size-xs);">${safeStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
