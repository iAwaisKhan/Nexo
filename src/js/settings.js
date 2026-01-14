import { appData } from './state.js';
import { saveAllData } from './storage.js';

export function initSettingsUI() {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = appData.theme || 'auto';
        themeSelect.addEventListener('change', (e) => {
            // Apply theme logic
        });
    }

    const autoSaveToggle = document.getElementById('autoSaveToggle');
    if (autoSaveToggle) {
        autoSaveToggle.checked = appData.settings.autoSave;
        autoSaveToggle.addEventListener('change', (e) => {
            appData.settings.autoSave = e.target.checked;
            saveAllData();
        });
    }
}

export function updateSettingsUI() {
    // Sync UI with appData.settings
}
