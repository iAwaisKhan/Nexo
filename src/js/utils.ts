export function escapeHTML(value: string = ''): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeForSingleQuote(value: string = ''): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

export function ensureObject(value: any, fallback: Record<string, any> = {}): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return fallback;
}

export function showNotification(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 3000): void {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconClass = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  toast.innerHTML = `
    <i class="fas fa-${iconClass}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function applyStaggerAnimation(container: HTMLElement): void {
  const animatableElements = container.querySelectorAll<HTMLElement>('.card, .note-card, .task-card, .snippet-card, .resource-card, .news-card, .event-card');

  animatableElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';

    setTimeout(() => {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 25);
  });
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
