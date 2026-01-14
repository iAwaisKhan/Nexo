import { switchView, toggleTheme } from './ui.js';
import { handleSearch } from './app-logic.js'; // I'll create this later or move it
import { toggleTaskComplete } from './tasks-logic.js'; // I'll create this later

export function setupEventListeners(lenis) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view, lenis);
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) globalSearch.addEventListener('input', handleSearch);
    
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.dataset.taskId);
            // This will be imported from a separate task-logic file
            if (typeof window.toggleTaskComplete === 'function') {
                 window.toggleTaskComplete(taskId);
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            e.target.classList.remove('active');
            setTimeout(() => {
                document.body.style.overflow = 'auto';
                if (lenis) lenis.start();
            }, 300);
        }
    });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('studyhub-theme');
        if (savedTheme === 'auto') {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            const icon = document.querySelector('#themeToggle i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    });
}
