import { appData } from './state.js';

export function updateDashboard() {
    updateGreeting();
    
    const stats = {
        totalNotes: appData.notes.length,
        activeTasks: appData.tasks.filter(t => t.status !== 'Done').length,
        codeSnippets: appData.snippets.length,
        savedResources: appData.resources.length
    };
    
    animateStatValue('totalNotes', stats.totalNotes);
    animateStatValue('activeTasks', stats.activeTasks);
    animateStatValue('codeSnippets', stats.codeSnippets);
    animateStatValue('savedResources', stats.savedResources);
    
    updateRecentActivity();
}

export function animateStatValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        element.setAttribute('data-target', targetValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateValue);
}

function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.getElementById('greetingText');
    
    if (!greetingElement) return;
    
    let greeting;
    if (hour >= 5 && hour < 12) {
        greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
        greeting = 'Good evening';
    } else {
        greeting = 'Welcome back';
    }
    
    greetingElement.textContent = greeting;
}

export function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    const activities = [
        { icon: 'fa-sticky-note', text: `Added ${appData.notes.length} notes`, time: 'Today', color: 'var(--color-primary)' },
        { icon: 'fa-tasks', text: `${appData.tasks.filter(t => t.status !== 'Done').length} tasks in progress`, time: 'Today', color: 'var(--color-success)' },
        { icon: 'fa-code', text: `${appData.snippets.length} code snippets saved`, time: 'This week', color: 'var(--color-warning)' },
        { icon: 'fa-book', text: `${appData.resources.length} resources bookmarked`, time: 'This week', color: 'var(--color-info)' }
    ];
    
    if (activities.every(a => a.text.match(/\d+/)[0] === '0')) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity. Start creating to see your progress!</p></div>';
        return;
    }
    
    container.innerHTML = activities.map((activity, index) => `
        <div class="activity-item" style="animation-delay: ${index * 0.1}s;">
            <div class="activity-icon" style="background: ${activity.color}15; color: ${activity.color};">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}
