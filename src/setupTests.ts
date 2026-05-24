import '@testing-library/jest-dom';

// Polyfill crypto.randomUUID in jsdom environment
if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  });
}

// Polyfill navigator.onLine for jsdom
if (!('onLine' in navigator)) {
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
}
