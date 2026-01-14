import { switchView, toggleTheme } from './ui.js';
import { exportAllData, safeParseArrayFromStorage } from './storage.js';

export function setupCompatibility() {
    window.switchView = switchView;
    window.toggleTheme = toggleTheme;
    window.exportAllData = exportAllData;
    // Add other global functions here
}
