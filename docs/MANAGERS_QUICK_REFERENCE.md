# Quick Reference - TypeScript Managers

**For Developers**: Quick access guide to all 6 managers

---

## 1️⃣ StateManager
**File**: `src/js/stateManager.ts`  
**Purpose**: Centralized state management

```typescript
import { stateManager } from './js/stateManager.ts';

// Update property
stateManager.updateProperty('theme', 'dark');

// Update nested
stateManager.updateNested('userProfile', { name: 'John' });

// Get state
const state = stateManager.getState();
const theme = stateManager.getProperty('theme');

// Subscribe
stateManager.subscribe((state) => { /* ... */ });

// Undo
stateManager.undo();

// Batch
stateManager.batchUpdate({ theme: 'dark', currentView: 'notes' });
```

---

## 2️⃣ DOMManager
**File**: `src/js/domManager.ts`  
**Purpose**: Type-safe DOM operations

```typescript
import { DOMManager } from './js/domManager.ts';

// Selection
const el = DOMManager.getElementById('myElement');
const els = DOMManager.querySelectorAll('.card');

// Classes
DOMManager.addClass(el, 'active');
DOMManager.removeClass(el, 'hidden');
DOMManager.toggleClass(el, 'active');

// Attributes
DOMManager.setAttribute(el, 'aria-label', 'Click');
DOMManager.getAttribute(el, 'data-id');

// Styles
DOMManager.setStyles(el, { opacity: '0.5' });

// Visibility
DOMManager.show(el);
DOMManager.hide(el);

// Events
const cleanup = DOMManager.addEventListener(el, 'click', () => {});
cleanup(); // Remove

// Utilities
DOMManager.setText(el, 'Text');
DOMManager.setHTML(el, '<span>HTML</span>');
DOMManager.clear(el);
```

---

## 3️⃣ ThemeManager
**File**: `src/js/themeManager.ts`  
**Purpose**: Type-safe theme management

```typescript
import { themeManager } from './js/themeManager.ts';

// Get/Set
const theme = themeManager.getTheme();
await themeManager.setTheme('dark');

// Toggle
await themeManager.toggleTheme();

// System preference
await themeManager.useSystemPreference();

// Subscribe
themeManager.subscribe((theme) => {});

// Check
if (themeManager.isDarkMode()) { }
if (themeManager.isLightMode()) { }

// CSS Variables
const color = themeManager.getCSSVariable('--color-primary');
themeManager.setCSSVariable('--color-primary', '#a56244');

// Config
const config = themeManager.getThemeConfig();
```

---

## 4️⃣ AnimationManager
**File**: `src/js/animationManager.ts`  
**Purpose**: Controlled animations with accessibility

```typescript
import { animationManager } from './js/animationManager.ts';

// Fade
await animationManager.fadeIn(el, { duration: 300 });
await animationManager.fadeOut(el);

// Slide
await animationManager.slideInDown(el);
await animationManager.slideInUp(el);

// Scale
await animationManager.scale(el, 1.2);

// Effects
await animationManager.pulse(el);
await animationManager.bounce(el);
await animationManager.shake(el);

// Stagger
const elements = DOMManager.querySelectorAll('.card');
await animationManager.staggerElements(
  elements,
  (el) => animationManager.fadeIn(el),
  50  // delay
);

// Transitions
animationManager.applyTransition(el, {
  properties: ['opacity', 'transform'],
  duration: 300,
  easing: 'ease-in-out'
});

// Cleanup
animationManager.clearAnimations(el);
animationManager.cancelAll();
```

---

## 5️⃣ ValidationManager
**File**: `src/js/validationManager.ts`  
**Purpose**: Type-safe form validation

```typescript
import { validationManager } from './js/validationManager.ts';

// Register rules
validationManager.registerRules('email', {
  required: true,
  email: true,
  maxLength: 255
});

validationManager.registerRules('password', {
  required: true,
  minLength: 8,
  pattern: /[A-Z]/  // At least one uppercase
});

// Validate field
const errors = validationManager.validateField('email', 'user@test.com');

// Validate data
const result = validationManager.validate({
  email: 'user@test.com',
  password: 'MyPassword123'
});

if (result.isValid) {
  // Process
} else {
  validationManager.displayErrors(result.errors);
}

// Form element
const form = DOMManager.getElementById('myForm');
const formResult = validationManager.validateFormElement(form);

// Clear
validationManager.clearErrors();

// Custom message
validationManager.setErrorMessage('required', 'Cannot be empty');
```

**Validation Rules**:
- `required` - Field required
- `minLength` - Minimum length
- `maxLength` - Maximum length
- `pattern` - RegExp pattern
- `email` - Email format
- `url` - URL format
- `number` - Numeric
- `positive` - Positive number
- `min` - Minimum value
- `max` - Maximum value
- `custom` - Custom function

---

## 6️⃣ ViewManager
**File**: `src/js/viewManager.ts`  
**Purpose**: Structured view management

```typescript
import { viewManager } from './js/viewManager.ts';

// Initialize
viewManager.initializeViews();

// Register
viewManager.registerView({
  name: 'notes',
  element: notesElement,
  onEnter: async () => loadNotes(),
  onExit: async () => saveNotes(),
  scrollToTop: true,
  animationDuration: 200
});

// Switch
await viewManager.switchTo('notes', lenis);

// Get current
const current = viewManager.getCurrentView();

// Subscribe
viewManager.subscribe((viewName) => {});

// Utilities
const el = viewManager.getViewElement('notes');
const exists = viewManager.hasView('notes');
const all = viewManager.getAllViews();

// Update
viewManager.updateView('notes', { onEnter: () => {} });

// Remove
viewManager.removeView('notes');
```

---

## Global Access

All managers are available on `window` for development/debugging:

```typescript
// In browser console
window.stateManager
window.DOMManager
window.themeManager
window.animationManager
window.validationManager
window.viewManager
```

---

## Common Patterns

### Pattern 1: Update State & UI
```typescript
stateManager.updateProperty('notes', newNotes);
DOMManager.setHTML(container, renderNotes(newNotes));
```

### Pattern 2: Form Validation
```typescript
const result = validationManager.validate(formData);
if (result.isValid) {
  await saveData(formData);
} else {
  validationManager.displayErrors(result.errors);
}
```

### Pattern 3: Theme Change with Animation
```typescript
await animationManager.fadeOut(container);
await themeManager.setTheme(newTheme);
await animationManager.fadeIn(container);
```

### Pattern 4: View Navigation
```typescript
viewManager.registerView({
  name: 'notes',
  element: notesEl,
  onEnter: async () => {
    const notes = await loadNotes();
    stateManager.updateProperty('notes', notes);
    renderNotes(notes);
  }
});

await viewManager.switchTo('notes');
```

### Pattern 5: Stagger Animation
```typescript
const cards = DOMManager.querySelectorAll('.card');
await animationManager.staggerElements(
  cards,
  (el, index) => animationManager.slideInUp(el),
  50
);
```

---

## Accessibility

All managers respect `prefers-reduced-motion`:

```typescript
// Automatically uses no motion for users who prefer it
await animationManager.fadeIn(el);
```

---

## Error Handling

All managers use defensive programming:

```typescript
// Safe - returns null if not found
const el = DOMManager.getElementById('missing');
if (el) {
  DOMManager.addClass(el, 'active');
}

// Safe - gracefully handles invalid data
const result = validationManager.validate(data);
console.log(result.errors);
```

---

## Best Practices

1. **Always use DOMManager** for DOM access
2. **Use stateManager** for data changes
3. **Subscribe to changes** instead of polling
4. **Await animations** for sequencing
5. **Register validation rules** once, reuse many times
6. **Use ViewManager** for navigation
7. **Check for null** before using elements

---

## Troubleshooting

### Manager not available?
```typescript
// Check if loaded
if (window.stateManager) {
  // Use manager
}
```

### Type errors in IDE?
```typescript
// Ensure imports
import { stateManager } from './js/stateManager.ts';
```

### Animation not respecting prefers-reduced-motion?
- Use AnimationManager instead of CSS animations
- It automatically handles accessibility

### State not updating UI?
- Use StateManager listeners
- Don't rely on manual DOM updates

---

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Last Updated**: January 18, 2026
