import { appData } from './state.js';
import { renderNotes } from './notes.js';
import { renderTasks } from './tasks.js';
import { renderSnippets } from './snippets.js';
import { renderResources } from './resources.js';
import { updateDashboard } from './dashboard.js';

export function loadSampleData() {
    appData.notes = [
        { id: 1, title: "JavaScript Basics", content: "Learn array methods: map, filter, reduce", tags: ["javascript", "programming"], category: "Study", created: new Date() },
        { id: 2, title: "Web Dev Projects", content: "Build portfolio, task manager, weather app", tags: ["projects", "web-dev"], category: "Project", created: new Date() }
    ];

    appData.tasks = [
        { id: 1, title: "Complete JavaScript assignment", description: "Build a todo list app", priority: "High", dueDate: "2025-11-20", status: "To Do" },
        { id: 2, title: "Read Chapter 5", description: "Data Structures chapter", priority: "Medium", dueDate: "2025-11-22", status: "In Progress" }
    ];

    appData.snippets = [
        { id: 1, title: "Fetch API", language: "JavaScript", code: "fetch('api/data').then(r => r.json())", tags: ["api", "fetch"] },
        { id: 2, title: "CSS Flexbox", language: "CSS", code: ".container { display: flex; justify-content: center; }", tags: ["css", "layout"] }
    ];

    appData.resources = [
        { id: 1, title: "MDN Web Docs", url: "https://developer.mozilla.org", category: "Documentation", tags: ["html", "css", "javascript"], description: "Comprehensive web development documentation" },
        { id: 2, title: "W3Schools", url: "https://www.w3schools.com", category: "Documentation", tags: ["html", "css", "javascript", "sql"], description: "Easy-to-understand web tutorials" }
    ];

    appData.schedule = [
        { id: 1, day: "monday", time: "09:00 AM", subject: "Data Structures", description: "Arrays and Linked Lists", location: "Room 301", completed: false }
    ];
}

export function renderAll() {
    renderNotes();
    renderTasks();
    renderSnippets();
    renderResources();
    updateDashboard();
}
