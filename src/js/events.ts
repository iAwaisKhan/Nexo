import { switchView, toggleTheme } from './ui.ts';
import { handleSearch } from './search.ts';
import { toggleTaskComplete } from './tasks.ts';
import { exportAllData, saveAllData } from './storage.ts';
import { showShortcutsModal } from './ui.ts';

export function setupEventListeners(lenis: any): void {
  document.querySelectorAll('.nav-item').forEach((item: Element) => {
    item.addEventListener('click', function(this: Element) {
      const view = this.getAttribute('data-view');
      if (view) switchView(view, lenis);
    });
  });

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) globalSearch.addEventListener('input', handleSearch);

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          saveAllData();
          break;
        case 'b':
          e.preventDefault();
          exportAllData();
          break;
        case '/':
          e.preventDefault();
          showShortcutsModal();
          break;
      }
    }
  });

  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('task-checkbox')) {
      const taskId = parseInt(target.dataset.taskId || '0');
      toggleTaskComplete(taskId);
    }
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const modal = target.closest('.modal');
    if (modal && modal.classList.contains('modal') && modal.classList.contains('active')) {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        if (lenis) lenis.start();
      }, 300);
    }
  });
}
