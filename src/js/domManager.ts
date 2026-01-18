/**
 * DOM Manager - Type-safe DOM manipulation utilities
 * Provides centralized, safe DOM operations with error handling
 */

export interface ElementQuery {
  id?: string;
  class?: string;
  selector?: string;
}

export class DOMManager {
  /**
   * Safely get element by ID with type safety
   */
  static getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
    try {
      return document.getElementById(id) as T | null;
    } catch (error) {
      console.warn(`Failed to get element with ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Safely get element by selector
   */
  static querySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    try {
      return document.querySelector(selector) as T | null;
    } catch (error) {
      console.warn(`Failed to query selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Safely get all elements matching selector
   */
  static querySelectorAll<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    try {
      return Array.from(document.querySelectorAll(selector)) as T[];
    } catch (error) {
      console.warn(`Failed to query all: ${selector}`, error);
      return [];
    }
  }

  /**
   * Add class to element
   */
  static addClass(element: HTMLElement | null, className: string): void {
    if (element) {
      element.classList.add(className);
    }
  }

  /**
   * Remove class from element
   */
  static removeClass(element: HTMLElement | null, className: string): void {
    if (element) {
      element.classList.remove(className);
    }
  }

  /**
   * Toggle class on element
   */
  static toggleClass(element: HTMLElement | null, className: string, force?: boolean): void {
    if (element) {
      element.classList.toggle(className, force);
    }
  }

  /**
   * Check if element has class
   */
  static hasClass(element: HTMLElement | null, className: string): boolean {
    return element?.classList.contains(className) ?? false;
  }

  /**
   * Set multiple classes
   */
  static setClasses(element: HTMLElement | null, ...classNames: string[]): void {
    if (element) {
      element.className = classNames.join(' ');
    }
  }

  /**
   * Set attribute
   */
  static setAttribute(element: HTMLElement | null, name: string, value: string): void {
    if (element) {
      element.setAttribute(name, value);
    }
  }

  /**
   * Get attribute
   */
  static getAttribute(element: HTMLElement | null, name: string): string | null {
    return element?.getAttribute(name) ?? null;
  }

  /**
   * Set multiple attributes
   */
  static setAttributes(element: HTMLElement | null, attrs: Record<string, string>): void {
    if (element) {
      Object.entries(attrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
  }

  /**
   * Set inline styles
   */
  static setStyles(element: HTMLElement | null, styles: Partial<CSSStyleDeclaration>): void {
    if (element) {
      Object.entries(styles).forEach(([key, value]) => {
        (element.style as any)[key] = value;
      });
    }
  }

  /**
   * Show element
   */
  static show(element: HTMLElement | null): void {
    if (element) {
      element.classList.remove('hidden');
      element.style.display = '';
    }
  }

  /**
   * Hide element
   */
  static hide(element: HTMLElement | null): void {
    if (element) {
      element.classList.add('hidden');
      element.style.display = 'none';
    }
  }

  /**
   * Toggle visibility
   */
  static toggleVisibility(element: HTMLElement | null, show?: boolean): void {
    if (element) {
      const shouldShow = show !== undefined ? show : element.style.display === 'none';
      shouldShow ? this.show(element) : this.hide(element);
    }
  }

  /**
   * Set text content safely
   */
  static setText(element: HTMLElement | null, text: string): void {
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Set HTML content (use with caution)
   */
  static setHTML(element: HTMLElement | null, html: string): void {
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * Clear element children
   */
  static clear(element: HTMLElement | null): void {
    if (element) {
      element.innerHTML = '';
    }
  }

  /**
   * Add event listener with cleanup
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | null,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    if (!element) return () => {};

    element.addEventListener(event, handler as EventListener, options);
    return () => element.removeEventListener(event, handler as EventListener, options);
  }

  /**
   * Remove all children
   */
  static removeChildren(element: HTMLElement | null): void {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  /**
   * Check if element exists in DOM
   */
  static exists(element: HTMLElement | null): boolean {
    return element !== null && document.body.contains(element);
  }

  /**
   * Get parent element matching selector
   */
  static getClosest<T extends HTMLElement = HTMLElement>(
    element: HTMLElement | null,
    selector: string
  ): T | null {
    if (!element) return null;
    return element.closest(selector) as T | null;
  }

  /**
   * Remove element from DOM
   */
  static remove(element: HTMLElement | null): void {
    if (element) {
      element.remove();
    }
  }

  /**
   * Get computed style
   */
  static getComputedStyle(element: HTMLElement | null): CSSStyleDeclaration | null {
    if (!element) return null;
    return window.getComputedStyle(element);
  }
}

export default DOMManager;
