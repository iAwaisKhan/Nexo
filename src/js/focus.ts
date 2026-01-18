import { showNotification } from './utils.ts';

let focusInterval: ReturnType<typeof setInterval> | null = null;
let focusSecondsRemaining: number = 0;
let focusPaused: boolean = false;

export function startFocusSession(minutes: number): void {
  if (focusInterval) {
    showNotification('A focus session is already running!', 'error');
    return;
  }
  focusSecondsRemaining = minutes * 60;
  focusPaused = false;

  document.getElementById('focusSessionModal')?.classList.add('active');

  focusInterval = setInterval(() => {
    if (!focusPaused) {
      focusSecondsRemaining--;
      updateFocusDisplay();
      if (focusSecondsRemaining <= 0) {
        completeFocusSession();
      }
    }
  }, 1000) as any;
}

function updateFocusDisplay(): void {
  const display = document.getElementById('focusTimerDisplay');
  if (!display) return;
  const minutes = Math.floor(focusSecondsRemaining / 60);
  const seconds = focusSecondsRemaining % 60;
  display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function pauseFocusSession(): void {
  focusPaused = !focusPaused;
}

export function stopFocusSession(): void {
  clearInterval(focusInterval as any);
  focusInterval = null;
  document.getElementById('focusSessionModal')?.classList.remove('active');
}

function completeFocusSession(): void {
  stopFocusSession();
  showNotification('Focus session complete!', 'success');
}

export function startCustomFocusSession(): void {
  const input = document.getElementById('customFocusMinutes') as HTMLInputElement;
  const minutes = parseInt(input?.value || '0');
  if (minutes > 0) {
    startFocusSession(minutes);
  }
}

export function viewFocusHistory(): void {
  showNotification('Focus history coming soon!', 'info');
}
