import { appData } from './state.js';
import { applyStaggerAnimation } from './utils.js';
import { saveAllData } from './storage.js';

export function initTheme() {
    const theme = appData.theme || 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = theme;
    }
}

export function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    appData.theme = newTheme;
    saveAllData();
    
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = newTheme;
    }
}

export function switchView(viewName, lenis) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

    const currentView = document.querySelector('.view.active');
    const targetView = document.getElementById(viewName + 'View');
    
    if (!targetView || currentView === targetView) return;
    
    if (currentView) {
        currentView.classList.remove('active');
    }
    
    requestAnimationFrame(() => {
        targetView.classList.add('active');
        appData.currentView = viewName;
        applyStaggerAnimation(targetView);
        
        if (lenis) {
            lenis.scrollTo(0, { duration: 0.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}
