import { appData } from './state.ts';
import { applyStaggerAnimation } from './utils.ts';
import { saveAllData } from './storage.ts';

declare global {
  interface LenisInterface {
    scrollTo(target: number, options: any): void;
    raf(time: number): void;
    start(): void;
  }
}

export function initTheme(): void {
  const theme = 'light';

  document.documentElement.setAttribute('data-theme', theme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.style.display = 'none';
  }

  const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
  if (themeSelect) {
    themeSelect.value = theme;
    themeSelect.disabled = true;
  }
}

export function toggleTheme(): void {
  // Dark mode removed
}

export function switchView(viewName: string, lenis?: LenisInterface | null): void {
  document.querySelectorAll('.nav-item').forEach((item: Element) => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

  const currentView = document.querySelector('.view.active') as HTMLElement | null;
  const targetView = document.getElementById(viewName + 'View') as HTMLElement | null;

  if (!targetView || currentView === targetView) return;

  if (currentView) {
    currentView.classList.remove('active');
  }

  requestAnimationFrame(() => {
    if (targetView) {
      targetView.classList.add('active');
      appData.currentView = viewName;
      applyStaggerAnimation(targetView);

      if (lenis) {
        lenis.scrollTo(0, { duration: 0.8, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });
}

export function showShortcutsModal(): void {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div style="display: grid; gap: var(--space-12);">
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>N</kbd><span>New Note</span></div>
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>T</kbd><span>New Task</span></div>
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>K</kbd><span>Focus Search</span></div>
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>S</kbd><span>Save All</span></div>
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>B</kbd><span>Export Backup</span></div>
          <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>/</kbd><span>Show Shortcuts</span></div>
          <div class="shortcut-item"><kbd>Esc</kbd><span>Close Modal</span></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
}
