// Unified entry point for Aura
import { initLenisScroll } from './js/scroll.js';
import { initTheme, toggleTheme, switchView } from './js/ui.js';
import { initSettingsUI } from './js/settings.js';
import { loadSampleData, renderAll } from './js/init.js';
import { migrateFromLocalStorage, loadAllData } from './js/storage.js';
import { setupEventListeners } from './js/events.js';
import { updateDashboard } from './js/dashboard.js';
import { updateCurrentDate, startLiveClock } from './js/clock.js';
import { displayRandomQuote } from './js/quotes.js';
import { initNetworkAnimation } from './js/visuals.js';
import { applyStaggerAnimation } from './js/utils.js';

// Import remaining logic from legacy module
import * as legacy from './js/legacy-logic.js';

let lenis;

async function initApp() {
    try {
        lenis = initLenisScroll();
        initTheme();
        initSettingsUI();
        
        // Handle Storage Update (LocalStorage -> IndexedDB)
        await migrateFromLocalStorage();
        
        // Load data from IndexedDB
        const loaded = await loadAllData();
        
        // Use sample data if nothing was loaded
        if (!loaded || (appData.notes.length === 0 && appData.tasks.length === 0)) {
            loadSampleData();
        }
        
        setupEventListeners(lenis);
        updateDashboard();
        updateCurrentDate();
        startLiveClock();
        displayRandomQuote();
        renderAll();
        initNetworkAnimation();
        
        // Initialize legacy components
        if (legacy.setupDayCardListeners) legacy.setupDayCardListeners();
        
    } catch (error) {
        console.error('Core app initialization failed:', error);
    }
    
    // Apply stagger animation to initial view
    const activeView = document.querySelector('.view.active');
    if (activeView) {
        applyStaggerAnimation(activeView);
    }
}

// Make critical functions global for HTML onclick compatibility
window.switchView = (view) => switchView(view, lenis);
window.toggleTheme = toggleTheme;
window.showProductivityReport = legacy.showProductivityReport;
window.exportAllData = legacy.exportAllData;
window.importData = legacy.importData;
window.openUserProfile = legacy.openUserProfile;
window.showShortcutsModal = legacy.showShortcutsModal;
window.toggleTaskComplete = legacy.toggleTaskComplete;

// Start the application
window.addEventListener('DOMContentLoaded', initApp);
