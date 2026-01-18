import { appData } from './state.ts';

export function updateProductivityStats(): void {
  const today = new Date().toDateString();
  const completedToday = appData.tasks.filter(t => t.status === 'Done' && new Date((t as any).completedDate || '').toDateString() === today).length;

  appData.productivity.completedToday = completedToday;

  const statsToday = document.getElementById('tasksCompletedToday');
  if (statsToday) statsToday.textContent = completedToday.toString();

  // Update progress bars etc.
}

export function showProductivityReport(): void {
  console.log('Productivity Report');
  // Implementation of productivity report modal
}
