/**
 * Theme Manager - Type-safe theme management
 * Handles theme switching, persistence, and reactive updates
 */

import { appData } from './state.ts';
import { DOMManager } from './domManager.ts';
import { stateManager } from './stateManager.ts';
import { saveAllData } from './storage.ts';

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

export class ThemeManager {
  private currentTheme: Theme = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.currentTheme = 'light';
    document.documentElement.setAttribute('data-theme', 'light');
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return 'light';
  }

  /**
   * Set theme
   */
  async setTheme(theme: Theme): Promise<void> {
    // Dark mode removed
    return;
  }

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Toggle theme
   */
  async toggleTheme(): Promise<void> {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    await this.setTheme(newTheme);
  }

  /**
   * Use system preference
   */
  async useSystemPreference(): Promise<void> {
    await this.setTheme(this.systemPreference);
  }

  /**
   * Get theme config
   */
  getThemeConfig(): ThemeConfig {
    const styles = window.getComputedStyle(document.documentElement);

    return {
      primary: styles.getPropertyValue('--color-primary').trim(),
      secondary: styles.getPropertyValue('--color-secondary').trim(),
      background: styles.getPropertyValue('--color-background').trim(),
      text: styles.getPropertyValue('--color-text').trim(),
      border: styles.getPropertyValue('--color-border').trim(),
    };
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(variableName: string): string {
    return window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  /**
   * Set CSS variable
   */
  setCSSVariable(variableName: string, value: string): void {
    document.documentElement.style.setProperty(variableName, value);
  }

  /**
   * Check if dark mode
   */
  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Check if light mode
   */
  isLightMode(): boolean {
    return this.currentTheme === 'light';
  }

  /**
   * Apply theme instantly
   */
  applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.notifyListeners();
  }
}

export const themeManager = new ThemeManager();
