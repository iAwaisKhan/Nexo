/**
 * Clock Manager - Optimized world clock with timezone support
 * Handles clock display, updates, and world time zones efficiently
 */

import { DOMManager } from './domManager.ts';

export interface TimeZone {
  name: string;
  offset: number;
  label: string;
}

export interface ClockConfig {
  format?: '12' | '24';
  showSeconds?: boolean;
  updateInterval?: number;
  timeZones?: TimeZone[];
}

export class ClockManager {
  private clockDisplay: HTMLElement | null = null;
  private dateDisplay: HTMLElement | null = null;
  private timeElement: HTMLElement | null = null;
  private dateElement: HTMLElement | null = null;
  private updateInterval: number | null = null;
  private updateIntervalMs: number = 1000;
  private config: ClockConfig = {
    format: '12',
    showSeconds: true,
    updateInterval: 1000,
  };
  private timeZones: Map<string, TimeZone> = new Map();
  private worldClockElements: Map<string, HTMLElement> = new Map();

  constructor(config?: ClockConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
      this.updateIntervalMs = config.updateInterval || 1000;
    }

    this.initializeTimeZones();
  }

  /**
   * Initialize common time zones
   */
  private initializeTimeZones(): void {
    const zones: TimeZone[] = [
      { name: 'London', offset: 0, label: 'GMT' },
      { name: 'New York', offset: -5, label: 'EST' },
      { name: 'Los Angeles', offset: -8, label: 'PST' },
      { name: 'Tokyo', offset: 9, label: 'JST' },
      { name: 'Sydney', offset: 10, label: 'AEDT' },
      { name: 'Dubai', offset: 4, label: 'GST' },
      { name: 'Singapore', offset: 8, label: 'SGT' },
      { name: 'Hong Kong', offset: 8, label: 'HKT' },
      { name: 'Bangkok', offset: 7, label: 'ICT' },
      { name: 'Mumbai', offset: 5.5, label: 'IST' },
      { name: 'Berlin', offset: 1, label: 'CET' },
      { name: 'São Paulo', offset: -3, label: 'BRT' },
    ];

    zones.forEach((zone) => {
      this.timeZones.set(zone.name, zone);
    });

    // Add custom zones if provided
    if (this.config.timeZones) {
      this.config.timeZones.forEach((zone) => {
        this.timeZones.set(zone.name, zone);
      });
    }
  }

  /**
   * Initialize clock displays
   */
  initialize(): void {
    this.clockDisplay = DOMManager.getElementById('clockDisplay');
    this.dateDisplay = DOMManager.getElementById('dateDisplay');
    this.timeElement = DOMManager.getElementById('currentTime');
    this.dateElement = DOMManager.getElementById('currentDate');

    // Start updating
    this.startClock();
    this.updateDate();
  }

  /**
   * Start live clock updates
   */
  private startClock(): void {
    // Immediate update to avoid delay
    this.updateClock();

    // Set up interval - use requestAnimationFrame for smoother updates
    this.updateInterval = window.setInterval(() => {
      this.updateClock();
    }, this.updateIntervalMs);
  }

  /**
   * Stop clock updates
   */
  stopClock(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update main clock display
   */
  private updateClock(): void {
    const now = new Date();

    // Update welcome time
    if (this.timeElement) {
      const timeString = this.formatTime(now);
      DOMManager.setText(this.timeElement, timeString);
    }

    // Update clock view display
    if (this.clockDisplay) {
      const timeString = this.formatTime(now);
      DOMManager.setText(this.clockDisplay, timeString);
    }
  }

  /**
   * Update date display
   */
  private updateDate(): void {
    const now = new Date();

    // Update welcome date
    if (this.dateElement) {
      const dateString = this.formatDate(now);
      DOMManager.setText(this.dateElement, dateString);
    }

    // Update clock view date
    if (this.dateDisplay) {
      const dateString = this.formatFullDate(now);
      DOMManager.setText(this.dateDisplay, dateString);
    }
  }

  /**
   * Format time string
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    if (!this.config.showSeconds) {
      if (this.config.format === '12') {
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const hour12 = parseInt(hours) % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
      }
      return `${hours}:${minutes}`;
    }

    if (this.config.format === '12') {
      const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
      const hour12 = parseInt(hours) % 12 || 12;
      return `${hour12}:${minutes}:${seconds} ${period}`;
    }

    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format date string
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Format full date with day
   */
  private formatFullDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Get time in specific timezone
   */
  getTimeInZone(zoneName: string): Date | null {
    const zone = this.timeZones.get(zoneName);
    if (!zone) return null;

    const now = new Date();
    const offset = zone.offset;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + offset * 3600000);
  }

  /**
   * Format time for a specific timezone
   */
  formatTimeInZone(zoneName: string): string {
    const time = this.getTimeInZone(zoneName);
    return time ? this.formatTime(time) : 'Invalid Zone';
  }

  /**
   * Get all available time zones
   */
  getTimeZones(): TimeZone[] {
    return Array.from(this.timeZones.values());
  }

  /**
   * Add custom timezone
   */
  addTimeZone(name: string, offset: number, label: string): void {
    this.timeZones.set(name, { name, offset, label });
  }

  /**
   * Remove timezone
   */
  removeTimeZone(name: string): void {
    this.timeZones.delete(name);
    this.worldClockElements.delete(name);
  }

  /**
   * Update world clock display for a timezone
   */
  updateWorldClock(zoneName: string, elementId: string): void {
    const element = DOMManager.getElementById<HTMLElement>(elementId);
    if (!element) return;

    this.worldClockElements.set(zoneName, element);
    this.updateWorldClockDisplay(zoneName);
  }

  /**
   * Update all world clock displays
   */
  private updateWorldClockDisplay(zoneName: string): void {
    const element = this.worldClockElements.get(zoneName);
    if (!element) return;

    const time = this.getTimeInZone(zoneName);
    if (time) {
      const timeString = this.formatTime(time);
      const zone = this.timeZones.get(zoneName);
      const label = zone?.label || '';

      DOMManager.setText(element, `${zoneName} ${label}\n${timeString}`);
    }
  }

  /**
   * Start world clock updates
   */
  startWorldClocks(): void {
    // Update world clocks in sync with main clock
    const updateWorldClocks = () => {
      this.worldClockElements.forEach((_, zoneName) => {
        this.updateWorldClockDisplay(zoneName);
      });
    };

    setInterval(updateWorldClocks, this.updateIntervalMs);
  }

  /**
   * Get current hour
   */
  getCurrentHour(): number {
    return new Date().getHours();
  }

  /**
   * Get greeting based on time
   */
  getGreeting(): string {
    const hour = this.getCurrentHour();

    if (hour < 6) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  /**
   * Get greeting emoji
   */
  getGreetingEmoji(): string {
    const hour = this.getCurrentHour();

    if (hour < 6) return '🌙';
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    if (hour < 21) return '🌆';
    return '🌙';
  }

  /**
   * Check if time is within range
   */
  isTimeInRange(startHour: number, endHour: number): boolean {
    const hour = this.getCurrentHour();
    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour;
    }
    // Handle overnight ranges
    return hour >= startHour || hour < endHour;
  }

  /**
   * Get time until next hour
   */
  getMinutesUntilNextHour(): number {
    const now = new Date();
    const minutesInHour = 60 - now.getMinutes();
    return minutesInHour === 60 ? 0 : minutesInHour;
  }

  /**
   * Set clock format
   */
  setFormat(format: '12' | '24'): void {
    this.config.format = format;
    this.updateClock();
  }

  /**
   * Set seconds display
   */
  setShowSeconds(show: boolean): void {
    this.config.showSeconds = show;
    this.updateClock();
  }

  /**
   * Set update interval
   */
  setUpdateInterval(interval: number): void {
    this.config.updateInterval = interval;
    this.updateIntervalMs = interval;

    // Restart with new interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.startClock();
    }
  }

  /**
   * Destroy clock manager
   */
  destroy(): void {
    this.stopClock();
    this.worldClockElements.clear();
  }
}

// Export singleton instance
export const clockManager = new ClockManager();
