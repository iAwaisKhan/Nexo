import { showNotification } from './utils.ts';

let stopwatchInterval: ReturnType<typeof setInterval> | null = null;
let stopwatchSeconds: number = 0;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let countdownSeconds: number = 0;

export function startStopwatch(): void {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;
    updateStopwatchDisplay();
  }, 1000);
}

export function pauseStopwatch(): void {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
}

export function resetStopwatch(): void {
  pauseStopwatch();
  stopwatchSeconds = 0;
  updateStopwatchDisplay();
}

function updateStopwatchDisplay(): void {
  const hours = Math.floor(stopwatchSeconds / 3600);
  const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
  const seconds = stopwatchSeconds % 60;
  const display = document.getElementById('stopwatchDisplay');
  if (display) {
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export function startCountdown(): void {
  const input = document.getElementById('countdownMinutes') as HTMLInputElement;
  const minutes = parseInt(input?.value || '0') || 0;
  if (minutes <= 0) {
    showNotification('Please enter valid minutes', 'error');
    return;
  }

  if (countdownInterval) clearInterval(countdownInterval);
  countdownSeconds = minutes * 60;
  updateCountdownDisplay();

  countdownInterval = setInterval(() => {
    countdownSeconds--;
    updateCountdownDisplay();
    if (countdownSeconds <= 0) {
      clearInterval(countdownInterval as any);
      countdownInterval = null;
      showNotification('Countdown complete!', 'success');
    }
  }, 1000);
}

export function resetCountdown(): void {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdownSeconds = 0;
  updateCountdownDisplay();
}

function updateCountdownDisplay(): void {
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const display = document.getElementById('countdownDisplay');
  if (display) {
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
