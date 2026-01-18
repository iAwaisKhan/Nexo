import { appData, ScheduleItem } from './state.ts';
import { escapeHTML, showNotification } from './utils.ts';

export function renderSchedule(filterDay: string = 'all'): void {
  const container = document.getElementById('scheduleContainer');
  if (!container) return;

  let scheduleItems = appData.schedule;

  if (filterDay !== 'all') {
    scheduleItems = scheduleItems.filter((item: ScheduleItem) => item.day === filterDay);
  }

  if (scheduleItems.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No schedule items for this day.</p></div>';
    return;
  }

  // Group by day
  const groupedSchedule = scheduleItems.reduce((acc: Record<string, ScheduleItem[]>, item: ScheduleItem) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  container.innerHTML = Object.keys(groupedSchedule).map((day: string) => {
    const safeDayLabel = escapeHTML(day);
    return `
      <div style="margin-bottom: var(--space-xl);">
        <h4 style="text-transform: capitalize; margin-bottom: var(--space-md); color: var(--accent);">
          <i class="fas fa-calendar-day"></i> ${safeDayLabel}
        </h4>
        ${groupedSchedule[day].map((item: ScheduleItem) => {
          const safeTime = escapeHTML(item.time || '');
          const safeSubject = escapeHTML(item.subject || '');
          const safeDescription = escapeHTML(item.description || '');
          return `
            <div class="schedule-item ${item.completed ? 'completed' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <div class="schedule-time"><i class="fas fa-clock"></i> ${safeTime}</div>
                  <div class="schedule-subject">${safeSubject}</div>
                  <div class="schedule-description">${safeDescription}</div>
                </div>
                <div style="display: flex; gap: var(--space-sm);">
                  <button class="btn btn-secondary" onclick="toggleScheduleComplete(${item.id})">
                    <i class="fas fa-${item.completed ? 'undo' : 'check'}"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}

export function toggleScheduleComplete(id: number): void {
  const item = appData.schedule.find((s: ScheduleItem) => s.id === id);
  if (item) {
    item.completed = !item.completed;
    renderSchedule((document.getElementById('scheduleFilter') as HTMLSelectElement)?.value || 'all');
    showNotification(item.completed ? 'Item completed' : 'Item reopened', 'success');
  }
}

export function filterSchedule(day: string): void {
  renderSchedule(day);
}

export function showScheduleEditor(): void {
  showNotification('Schedule editor coming soon!', 'info');
}
