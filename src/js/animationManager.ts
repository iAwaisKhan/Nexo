/**
 * Animation Manager - Type-safe animation and transition handling
 * Moves animation logic from CSS to TypeScript for better control
 */

import { DOMManager } from './domManager.ts';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  easingValue?: string;
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
  timingFunction?: (progress: number) => number;
}

export interface TransitionOptions {
  properties: string[];
  duration?: number;
  easing?: string;
  delay?: number;
}

export class AnimationManager {
  private animations: Map<HTMLElement, Animation[]> = new Map();
  private reducedMotion = this.detectReducedMotion();

  constructor() {
    // Listen for changes to prefers-reduced-motion
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });
  }

  /**
   * Detect if user prefers reduced motion
   */
  private detectReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Fade in element
   */
  async fadeIn(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element || this.reducedMotion) {
      DOMManager.setStyles(element, { opacity: '1' });
      return;
    }

    const duration = options.duration ?? 300;
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out ${delay}ms`;

      setTimeout(() => {
        element.style.opacity = '1';
        setTimeout(resolve, duration + delay);
      }, 10);
    });
  }

  /**
   * Fade out element
   */
  async fadeOut(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element || this.reducedMotion) {
      DOMManager.setStyles(element, { opacity: '0' });
      return;
    }

    const duration = options.duration ?? 300;
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease-in-out ${delay}ms`;
      element.style.opacity = '0';
      setTimeout(resolve, duration + delay);
    });
  }

  /**
   * Slide in from top
   */
  async slideInDown(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element) return;
    if (this.reducedMotion) {
      DOMManager.setStyles(element, { transform: 'translateY(0)', opacity: '1' });
      return;
    }

    const duration = options.duration ?? 400;
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      element.style.transform = 'translateY(-20px)';
      element.style.opacity = '0';
      element.style.transition = `all ${duration}ms ease-out ${delay}ms`;

      setTimeout(() => {
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        setTimeout(resolve, duration + delay);
      }, 10);
    });
  }

  /**
   * Slide in from bottom
   */
  async slideInUp(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element) return;
    if (this.reducedMotion) {
      DOMManager.setStyles(element, { transform: 'translateY(0)', opacity: '1' });
      return;
    }

    const duration = options.duration ?? 400;
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      element.style.transform = 'translateY(20px)';
      element.style.opacity = '0';
      element.style.transition = `all ${duration}ms ease-out ${delay}ms`;

      setTimeout(() => {
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        setTimeout(resolve, duration + delay);
      }, 10);
    });
  }

  /**
   * Scale animation
   */
  async scale(
    element: HTMLElement | null,
    targetScale: number = 1,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element) return;
    if (this.reducedMotion) {
      DOMManager.setStyles(element, { transform: `scale(${targetScale})` });
      return;
    }

    const duration = options.duration ?? 300;
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      element.style.transition = `transform ${duration}ms ease-in-out ${delay}ms`;
      element.style.transform = `scale(${targetScale})`;
      setTimeout(resolve, duration + delay);
    });
  }

  /**
   * Pulse animation (repeated scale)
   */
  async pulse(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element) return;

    const duration = options.duration ?? 500;
    const iterCount = options.iterationCount ?? 2;
    const iterations = typeof iterCount === 'number' ? iterCount : 2;

    for (let i = 0; i < iterations; i++) {
      await this.scale(element, 1.05, { duration: duration / 2 });
      await this.scale(element, 1, { duration: duration / 2 });
    }
  }

  /**
   * Shake animation
   */
  async shake(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element || this.reducedMotion) return;

    const duration = options.duration ?? 300;
    const offset = 5;

    return new Promise((resolve) => {
      const originalTransform = element.style.transform;
      element.style.transition = `transform 50ms ease-in-out`;

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const shake = Math.sin(progress * Math.PI * 6) * offset;
          element.style.transform = `${originalTransform} translateX(${shake}px)`;
          requestAnimationFrame(animate);
        } else {
          element.style.transform = originalTransform;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Bounce animation
   */
  async bounce(
    element: HTMLElement | null,
    options: Omit<AnimationOptions, 'keyframes'> = {}
  ): Promise<void> {
    if (!element || this.reducedMotion) return;

    const duration = options.duration ?? 600;
    const height = 20;

    return new Promise((resolve) => {
      const originalTransform = element.style.transform;
      const startTime = Date.now();

      const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const bounce = Math.sin(progress * Math.PI) * height * easeOutQuad(progress);
          element.style.transform = `${originalTransform} translateY(-${bounce}px)`;
          requestAnimationFrame(animate);
        } else {
          element.style.transform = originalTransform;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Stagger animation for multiple elements
   */
  async staggerElements(
    elements: HTMLElement[],
    animationFn: (el: HTMLElement, index: number) => Promise<void>,
    staggerDelay: number = 50
  ): Promise<void> {
    const promises = elements.map((el, index) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          animationFn(el, index).then(resolve);
        }, index * staggerDelay);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Apply CSS transition
   */
  applyTransition(element: HTMLElement | null, options: TransitionOptions): void {
    if (!element) return;

    const duration = options.duration ?? 300;
    const easing = options.easing ?? 'ease-in-out';
    const delay = options.delay ?? 0;
    const transitionValue = options.properties
      .map((prop) => `${prop} ${duration}ms ${easing} ${delay}ms`)
      .join(', ');

    element.style.transition = transitionValue;
  }

  /**
   * Clear animations from element
   */
  clearAnimations(element: HTMLElement | null): void {
    if (!element) return;

    element.style.animation = 'none';
    element.style.transition = 'none';
    this.animations.delete(element);
  }

  /**
   * Cancel all animations
   */
  cancelAll(): void {
    this.animations.forEach((anims) => {
      anims.forEach((anim) => {
        anim.cancel();
      });
    });
    this.animations.clear();
  }
}

export const animationManager = new AnimationManager();
