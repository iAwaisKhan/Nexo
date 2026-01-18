import { clockManager } from './clockManager.ts';
import { DOMManager } from './domManager.ts';

/**
 * Update current date in welcome section
 * @deprecated Use clockManager.updateDate() instead
 */
export function updateCurrentDate(): void {
  const dateElement = DOMManager.getElementById('currentDate');
  if (!dateElement) return;

  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  DOMManager.setText(dateElement, now.toLocaleDateString('en-US', options));
}

/**
 * Start live clock updates in welcome section
 * @deprecated Use clockManager.initialize() instead
 */
export function startLiveClock(): void {
  const timeElement = DOMManager.getElementById('currentTime');
  if (!timeElement) return;

  // Initialize clock manager
  clockManager.initialize();
}

/**
 * Initialize world clock grid with major cities
 */
export function initializeWorldClock(): void {
  const worldClockGrid = DOMManager.getElementById('worldClockGrid');
  if (!worldClockGrid) return;

  // Major world clock timezones
  const majorCities = ['London', 'New York', 'Tokyo', 'Sydney', 'Dubai', 'Singapore', 'Hong Kong', 'Berlin'];

  // Create and render world clock cards
  const html = majorCities.map(city => `
    <div class="world-clock-card" data-timezone="${city}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);">${city}</h3>
        <span class="timezone-offset" style="font-size: 12px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 8px; border-radius: 4px;"></span>
      </div>
      <div class="world-clock-time" style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, var(--accent) 0%, #818CF8 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; margin: var(--space-md) 0;">--:--</div>
      <div class="world-clock-date" style="font-size: 12px; color: var(--text-secondary);">--</div>
    </div>
  `).join('');

  DOMManager.setHTML(worldClockGrid, html);
  updateWorldClockDisplay();
  
  // Update world clock every second
  setInterval(() => {
    updateWorldClockDisplay();
  }, 1000);
}

/**
 * Update world clock display with current times
 */
function updateWorldClockDisplay(): void {
  const worldClockCards = DOMManager.querySelectorAll<HTMLElement>('.world-clock-card');
  
  worldClockCards.forEach(card => {
    const timezone = DOMManager.getAttribute(card, 'data-timezone');
    if (!timezone) return;

    const timeElement = card.querySelector('.world-clock-time') as HTMLElement;
    const dateElement = card.querySelector('.world-clock-date') as HTMLElement;
    const offsetElement = card.querySelector('.timezone-offset') as HTMLElement;

    if (timeElement && dateElement && offsetElement) {
      const timeInZone = clockManager.formatTimeInZone(timezone);
      const dateInZone = new Date(new Date().toLocaleString('en-US', { timeZone: getTimezoneId(timezone) }));
      const dateStr = dateInZone.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate offset
      const offset = getTimezoneOffset(timezone);
      
      DOMManager.setText(timeElement, timeInZone);
      DOMManager.setText(dateElement, dateStr);
      DOMManager.setText(offsetElement, `UTC${offset >= 0 ? '+' : ''}${offset}`);
    }
  });
}

/**
 * Get IANA timezone ID from city name
 */
function getTimezoneId(city: string): string {
  const timezoneMap: Record<string, string> = {
    'London': 'Europe/London',
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles',
    'Tokyo': 'Asia/Tokyo',
    'Sydney': 'Australia/Sydney',
    'Dubai': 'Asia/Dubai',
    'Singapore': 'Asia/Singapore',
    'Hong Kong': 'Asia/Hong_Kong',
    'Bangkok': 'Asia/Bangkok',
    'Mumbai': 'Asia/Kolkata',
    'Berlin': 'Europe/Berlin',
    'São Paulo': 'America/Sao_Paulo'
  };
  return timezoneMap[city] || 'UTC';
}

/**
 * Get UTC offset for a city
 */
function getTimezoneOffset(city: string): number {
  const now = new Date();
  const tzId = getTimezoneId(city);
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tzId }));
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  return Math.round((tzDate.getTime() - localDate.getTime()) / 3600000);
}

/**
 * Export clock manager for advanced usage
 */
export { clockManager };
