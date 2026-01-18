import { appData } from './state.ts';
import { showNotification } from './utils.ts';
import { clockManager } from './clockManager.ts';
import { DOMManager } from './domManager.ts';

export function updateDashboard(): void {
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

export function refreshRecentActivity(): void {
  updateRecentActivity();
  showNotification('Dashboard refreshed', 'success');
}

export function animateStatValue(elementId: string, targetValue: number): void {
  const element = DOMManager.getElementById(elementId);
  if (!element) return;

  const startValue = parseInt(element.textContent || '0') || 0;
  const duration = 1000;
  const startTime = performance.now();

  function updateValue(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

    DOMManager.setText(element, currentValue.toString());
    DOMManager.setAttribute(element, 'data-target', targetValue.toString());

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      DOMManager.setText(element, targetValue.toString());
    }
  }

  requestAnimationFrame(updateValue);
}

/**
 * Update greeting based on time of day
 * Uses ClockManager for consistent time handling
 */
function updateGreeting(): void {
  const greetingElement = DOMManager.getElementById('greetingText');
  if (!greetingElement) return;

  const greeting = clockManager.getGreeting();
  DOMManager.setText(greetingElement, greeting);
}

export function updateRecentActivity(): void {
  const container = DOMManager.getElementById('recentActivity');
  if (!container) return;

  const activities = [
    { icon: 'fa-sticky-note', text: `Added ${appData.notes.length} notes`, time: 'Today', color: 'var(--color-primary)' },
    { icon: 'fa-tasks', text: `${appData.tasks.filter(t => t.status !== 'Done').length} tasks in progress`, time: 'Today', color: 'var(--color-success)' },
    { icon: 'fa-code', text: `${appData.snippets.length} code snippets saved`, time: 'This week', color: 'var(--color-warning)' },
    { icon: 'fa-book', text: `${appData.resources.length} resources bookmarked`, time: 'This week', color: 'var(--color-info)' }
  ];

  if (activities.every(a => a.text.match(/\d+/)?.[0] === '0')) {
    DOMManager.setHTML(container, '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity. Start creating to see your progress!</p></div>');
    return;
  }

  const html = activities.map((activity, index) => `
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

  DOMManager.setHTML(container, html);
}
