/**
 * View Manager - Type-safe view/page management
 * Handles view transitions and state management
 */

import { DOMManager } from './domManager.ts';
import { animationManager } from './animationManager.ts';
import { stateManager } from './stateManager.ts';

export type ViewName =
  | 'dashboard'
  | 'notes'
  | 'tasks'
  | 'snippets'
  | 'resources'
  | 'schedule'
  | 'focus'
  | 'pomodoro'
  | 'timer'
  | 'news';

export interface ViewConfig {
  name: ViewName;
  element: HTMLElement;
  onEnter?: () => void | Promise<void>;
  onExit?: () => void | Promise<void>;
  scrollToTop?: boolean;
  animationDuration?: number;
}

export class ViewManager {
  private views: Map<ViewName, ViewConfig> = new Map();
  private currentView: ViewName | null = null;
  private isTransitioning = false;
  private listeners: Set<(view: ViewName) => void> = new Set();

  /**
   * Register a view
   */
  registerView(config: ViewConfig): void {
    this.views.set(config.name, config);
  }

  /**
   * Subscribe to view changes
   */
  subscribe(listener: (view: ViewName) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(view: ViewName): void {
    this.listeners.forEach((listener) => listener(view));
  }

  /**
   * Get current view
   */
  getCurrentView(): ViewName | null {
    return this.currentView;
  }

  /**
   * Check if view exists
   */
  hasView(viewName: ViewName): boolean {
    return this.views.has(viewName);
  }

  /**
   * Switch to view
   */
  async switchTo(
    viewName: ViewName,
    lenis?: any,
    options: { scroll?: boolean; animate?: boolean } = {}
  ): Promise<void> {
    if (this.isTransitioning || this.currentView === viewName) {
      return;
    }

    this.isTransitioning = true;

    try {
      const view = this.views.get(viewName);
      if (!view) {
        console.warn(`View not found: ${viewName}`);
        this.isTransitioning = false;
        return;
      }

      // Update navigation
      DOMManager.querySelectorAll('.nav-item').forEach((item) => {
        DOMManager.removeClass(item, 'active');
      });

      const navItem = DOMManager.querySelector(`[data-view="${viewName}"]`);
      if (navItem) {
        DOMManager.addClass(navItem, 'active');
      }

      // Get current view
      const currentViewElement = DOMManager.querySelector<HTMLElement>('.view.active');
      const targetViewElement = view.element;

      // Exit current view
      if (currentViewElement && currentViewElement !== targetViewElement) {
        if (this.currentView) {
          const currentConfig = this.views.get(this.currentView);
          if (currentConfig?.onExit) {
            await currentConfig.onExit();
          }
        }

        if (options.animate !== false) {
          await animationManager.fadeOut(currentViewElement, {
            duration: view.animationDuration ?? 200,
          });
        }

        DOMManager.removeClass(currentViewElement, 'active');
      }

      // Enter new view
      DOMManager.addClass(targetViewElement, 'active');

      if (options.animate !== false) {
        await animationManager.fadeIn(targetViewElement, {
          duration: view.animationDuration ?? 200,
        });
      }

      // Call enter hook
      if (view.onEnter) {
        await view.onEnter();
      }

      // Update state
      this.currentView = viewName;
      stateManager.updateProperty('currentView', viewName);

      // Scroll to top
      if (options.scroll !== false && view.scrollToTop !== false) {
        if (lenis) {
          lenis.scrollTo(0, {
            duration: 0.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      // Notify listeners
      this.notifyListeners(viewName);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Get view element
   */
  getViewElement(viewName: ViewName): HTMLElement | null {
    return this.views.get(viewName)?.element ?? null;
  }

  /**
   * Initialize all views
   */
  initializeViews(): void {
    const viewNames: ViewName[] = [
      'dashboard',
      'notes',
      'tasks',
      'snippets',
      'resources',
      'schedule',
      'focus',
      'pomodoro',
      'timer',
      'news',
    ];

    viewNames.forEach((viewName) => {
      const element = DOMManager.getElementById<HTMLElement>(`${viewName}View`);
      if (element) {
        this.registerView({
          name: viewName,
          element,
          scrollToTop: true,
        });
      }
    });
  }

  /**
   * Update view
   */
  updateView(viewName: ViewName, config: Partial<ViewConfig>): void {
    const existing = this.views.get(viewName);
    if (existing) {
      this.views.set(viewName, { ...existing, ...config });
    }
  }

  /**
   * Remove view
   */
  removeView(viewName: ViewName): void {
    this.views.delete(viewName);
  }

  /**
   * Get all views
   */
  getAllViews(): ViewName[] {
    return Array.from(this.views.keys());
  }
}

export const viewManager = new ViewManager();
