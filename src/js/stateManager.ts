/**
 * State Manager - Centralized state management with reactive updates
 * Provides type-safe state mutations and subscriptions
 */

import { appData, AppData } from './state.ts';

export type StateListener = (state: AppData) => void;

class StateManager {
  private listeners: Set<StateListener> = new Set();
  private state: AppData = appData;
  private history: AppData[] = [JSON.parse(JSON.stringify(appData))];
  private maxHistory = 50;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update a single property in app data
   */
  updateProperty<K extends keyof AppData>(key: K, value: AppData[K]): void {
    this.state[key] = value;
    this.addToHistory();
    this.notifyListeners();
  }

  /**
   * Update a nested property
   */
  updateNested<K extends keyof AppData>(
    key: K,
    updates: Partial<AppData[K]>
  ): void {
    const current = this.state[key];
    if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
      (this.state[key] as any) = { ...current, ...updates };
      this.addToHistory();
      this.notifyListeners();
    }
  }

  /**
   * Get current state
   */
  getState(): AppData {
    return this.state;
  }

  /**
   * Get specific property
   */
  getProperty<K extends keyof AppData>(key: K): AppData[K] {
    return this.state[key];
  }

  /**
   * Batch updates
   */
  batchUpdate(updates: Partial<AppData>): void {
    Object.entries(updates).forEach(([key, value]) => {
      (this.state[key as keyof AppData] as any) = value;
    });
    this.addToHistory();
    this.notifyListeners();
  }

  /**
   * Undo last change
   */
  undo(): void {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current state
      this.state = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
      this.notifyListeners();
    }
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [JSON.parse(JSON.stringify(this.state))];
  }

  /**
   * Add state to history
   */
  private addToHistory(): void {
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }
}

// Export singleton instance
export const stateManager = new StateManager();
