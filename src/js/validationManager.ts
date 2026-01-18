/**
 * Validation Manager - Type-safe form and data validation
 * Provides comprehensive validation with error messaging
 */

import { DOMManager } from './domManager.ts';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  positive?: boolean;
  min?: number;
  max?: number;
};

export interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationManager {
  private rules: Map<string, ValidationRule> = new Map();
  private errorMessages: Map<string, string> = new Map();

  constructor() {
    this.setupDefaultRules();
  }

  /**
   * Setup default error messages
   */
  private setupDefaultRules(): void {
    this.errorMessages.set('required', 'This field is required');
    this.errorMessages.set('minLength', 'Minimum length is {minLength}');
    this.errorMessages.set('maxLength', 'Maximum length is {maxLength}');
    this.errorMessages.set('pattern', 'Invalid format');
    this.errorMessages.set('email', 'Invalid email address');
    this.errorMessages.set('url', 'Invalid URL');
    this.errorMessages.set('number', 'Must be a number');
    this.errorMessages.set('positive', 'Must be a positive number');
    this.errorMessages.set('min', 'Minimum value is {min}');
    this.errorMessages.set('max', 'Maximum value is {max}');
  }

  /**
   * Register validation rules for a field
   */
  registerRules(field: string, rules: ValidationRule): void {
    this.rules.set(field, rules);
  }

  /**
   * Set custom error message
   */
  setErrorMessage(rule: string, message: string): void {
    this.errorMessages.set(rule, message);
  }

  /**
   * Validate single field
   */
  validateField(field: string, value: any): ValidationError[] {
    const errors: ValidationError[] = [];
    const rules = this.rules.get(field);

    if (!rules) return errors;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push({
        field,
        message: this.errorMessages.get('required') || 'This field is required',
        rule: 'required',
      });
      return errors;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return errors;
    }

    const stringValue = String(value);
    const numValue = Number(value);

    // Min length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push({
        field,
        message: (this.errorMessages.get('minLength') || '').replace('{minLength}', String(rules.minLength)),
        rule: 'minLength',
      });
    }

    // Max length validation
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push({
        field,
        message: (this.errorMessages.get('maxLength') || '').replace('{maxLength}', String(rules.maxLength)),
        rule: 'maxLength',
      });
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push({
        field,
        message: this.errorMessages.get('pattern') || 'Invalid format',
        rule: 'pattern',
      });
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        errors.push({
          field,
          message: this.errorMessages.get('email') || 'Invalid email address',
          rule: 'email',
        });
      }
    }

    // URL validation
    if (rules.url) {
      try {
        new URL(stringValue);
      } catch {
        errors.push({
          field,
          message: this.errorMessages.get('url') || 'Invalid URL',
          rule: 'url',
        });
      }
    }

    // Number validation
    if (rules.number && isNaN(numValue)) {
      errors.push({
        field,
        message: this.errorMessages.get('number') || 'Must be a number',
        rule: 'number',
      });
    }

    // Positive number validation
    if (rules.positive && numValue <= 0) {
      errors.push({
        field,
        message: this.errorMessages.get('positive') || 'Must be a positive number',
        rule: 'positive',
      });
    }

    // Min value validation
    if (rules.min && numValue < rules.min) {
      errors.push({
        field,
        message: (this.errorMessages.get('min') || '').replace('{min}', String(rules.min)),
        rule: 'min',
      });
    }

    // Max value validation
    if (rules.max && numValue > rules.max) {
      errors.push({
        field,
        message: (this.errorMessages.get('max') || '').replace('{max}', String(rules.max)),
        rule: 'max',
      });
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (result !== true) {
        errors.push({
          field,
          message: typeof result === 'string' ? result : 'Invalid value',
          rule: 'custom',
        });
      }
    }

    return errors;
  }

  /**
   * Validate multiple fields
   */
  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];

    Object.entries(data).forEach(([field, value]) => {
      const fieldErrors = this.validateField(field, value);
      errors.push(...fieldErrors);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get errors for specific field
   */
  getFieldErrors(field: string, value: any): ValidationError[] {
    return this.validateField(field, value);
  }

  /**
   * Display errors on form
   */
  displayErrors(errors: ValidationError[]): void {
    // Clear previous error displays
    DOMManager.querySelectorAll('.error-message').forEach((el) => {
      DOMManager.remove(el);
    });

    DOMManager.querySelectorAll('.form-error').forEach((el) => {
      DOMManager.removeClass(el, 'form-error');
    });

    // Display new errors
    errors.forEach((error) => {
      const field = DOMManager.getElementById(error.field);
      if (field) {
        DOMManager.addClass(field, 'form-error');

        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = error.message;

        if (field.parentNode) {
          field.parentNode.insertBefore(errorEl, field.nextSibling);
        }
      }
    });
  }

  /**
   * Clear error display
   */
  clearErrors(): void {
    DOMManager.querySelectorAll('.error-message').forEach((el) => {
      DOMManager.remove(el);
    });

    DOMManager.querySelectorAll('.form-error').forEach((el) => {
      DOMManager.removeClass(el, 'form-error');
    });
  }

  /**
   * Validate form element
   */
  validateFormElement(form: HTMLFormElement): ValidationResult {
    const data: Record<string, any> = {};

    Array.from(form.elements).forEach((element) => {
      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (input.name) {
        if (input.type === 'checkbox') {
          data[input.name] = (input as HTMLInputElement).checked;
        } else if (input.type === 'radio') {
          const checked = form.querySelector(`input[name="${input.name}"]:checked`);
          data[input.name] = checked ? (checked as HTMLInputElement).value : '';
        } else {
          data[input.name] = input.value;
        }
      }
    });

    return this.validate(data);
  }
}

export const validationManager = new ValidationManager();
