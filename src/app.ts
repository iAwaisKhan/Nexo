// Unified entry point for Aura
import { initLenisScroll } from './js/scroll.ts';
import { initTheme, toggleTheme, switchView, showShortcutsModal } from './js/ui.ts';
import { initSettingsUI, changeTheme, toggleSetting } from './js/settings.ts';
import { loadSampleData, renderAll } from './js/init.ts';
import { migrateFromLocalStorage, loadAllData, exportAllData, importData, clearAllData } from './js/storage.ts';
import { setupEventListeners } from './js/events.ts';
import { updateDashboard, refreshRecentActivity } from './js/dashboard.ts';
import { updateCurrentDate, startLiveClock } from './js/clock.ts';
import { displayRandomQuote } from './js/quotes.ts';
import { initNetworkAnimation } from './js/visuals.ts';
import { applyStaggerAnimation } from './js/utils.ts';
import { setPomodoroMode, startPomodoro, pausePomodoro, resetPomodoro } from './js/pomodoro.ts';
import { filterResources, showResourceEditor, resetResourceFilters } from './js/resources.ts';
import { toggleTaskComplete, filterTasks, sortTasks, selectAllTasks, markSelectedTasksComplete, deleteSelectedTasks, showTaskEditor } from './js/tasks.ts';
import { showNoteEditor } from './js/notes.ts';
import { showSnippetEditor, copySnippet } from './js/snippets.ts';
import { showScheduleEditor, toggleScheduleComplete, filterSchedule } from './js/schedule.ts';
import { startFocusSession, startCustomFocusSession, pauseFocusSession, stopFocusSession, viewFocusHistory } from './js/focus.ts';
import { openUserProfile, closeUserProfile, saveUserProfile, changeAvatar } from './js/profile.ts';
import { showProductivityReport } from './js/productivity.ts';
import { startStopwatch, pauseStopwatch, resetStopwatch, startCountdown, resetCountdown } from './js/timer.ts';
import { initTechNews, filterNewsByCategory, initTechEvents, filterEventsByType, filterEventsByTime } from './js/news.ts';
import { appData } from './js/state.ts';

declare global {
  interface Window {
    switchView: (view: string, lenis?: any) => void;
    lenis?: any;
    toggleTheme: () => void;
    changeTheme: (theme: string) => void;
    toggleSetting: (setting: string) => void;
    showProductivityReport: () => void;
    exportAllData: () => Promise<void>;
    importData: (event: Event) => Promise<void>;
    clearAllData: () => Promise<void>;
    openUserProfile: () => void;
    closeUserProfile: () => void;
    saveUserProfile: () => void;
    changeAvatar: () => void;
    showShortcutsModal: () => void;
    toggleTaskComplete: (taskId: number) => void;
    refreshRecentActivity: () => void;
    displayRandomQuote: () => void;
    showNoteEditor: (noteId?: number | null) => void;
    showTaskEditor: () => void;
    selectAllTasks: () => void;
    markSelectedTasksComplete: () => void;
    deleteSelectedTasks: () => void;
    showSnippetEditor: () => void;
    showScheduleEditor: () => void;
    viewFocusHistory: () => void;
    filterTasks: (filter: string) => void;
    sortTasks: (sortBy: string) => void;
    filterSchedule: (day: string) => void;
    startFocusSession: (minutes: number) => void;
    startCustomFocusSession: () => void;
    pauseFocusSession: () => void;
    stopFocusSession: () => void;
    copySnippet: (code: string) => void;
    toggleScheduleComplete: (id: number) => void;
    setPomodoroMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
    startPomodoro: () => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    startStopwatch: () => void;
    pauseStopwatch: () => void;
    resetStopwatch: () => void;
    startCountdown: () => void;
    resetCountdown: () => void;
    filterResources: () => void;
    showResourceEditor: () => void;
    resetResourceFilters: () => void;
    initTechNews: () => void;
    filterNewsByCategory: (category: string) => void;
    initTechEvents: () => void;
    filterEventsByType: (type: string) => void;
    filterEventsByTime: (timeFrame: string) => void;
  }
}

let lenis: any;

async function initApp(): Promise<void> {
  try {
    lenis = initLenisScroll();
    window.lenis = lenis;
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

    // Initialize news and events
    initTechNews();
    initTechEvents();
  } catch (error) {
    console.error('Core app initialization failed:', error);
  }

  // Apply stagger animation to initial view
  const activeView = document.querySelector('.view.active') as HTMLElement;
  if (activeView) {
    applyStaggerAnimation(activeView);
  }
}

// Make functions global for HTML onclick compatibility
window.switchView = (view: string, lenisParam?: any) => switchView(view, lenisParam || lenis);
window.toggleTheme = toggleTheme;
window.changeTheme = changeTheme;
window.toggleSetting = toggleSetting;
window.showProductivityReport = showProductivityReport;
window.exportAllData = exportAllData;
window.importData = (event?: Event) => {
  if (event) {
    return importData(event);
  } else {
    // If called without event, trigger file input click
    const fileInput = document.getElementById('importFile') as HTMLInputElement;
    if (fileInput) fileInput.click();
    return Promise.resolve();
  }
};
window.clearAllData = clearAllData;
window.openUserProfile = openUserProfile;
window.closeUserProfile = closeUserProfile;
window.saveUserProfile = saveUserProfile;
window.changeAvatar = changeAvatar;
window.showShortcutsModal = showShortcutsModal;
window.toggleTaskComplete = toggleTaskComplete;
window.refreshRecentActivity = refreshRecentActivity;
window.displayRandomQuote = displayRandomQuote;
window.showNoteEditor = showNoteEditor;
window.showTaskEditor = showTaskEditor;
window.selectAllTasks = selectAllTasks;
window.markSelectedTasksComplete = markSelectedTasksComplete;
window.deleteSelectedTasks = deleteSelectedTasks;
window.showSnippetEditor = showSnippetEditor;
window.showScheduleEditor = showScheduleEditor;
window.viewFocusHistory = viewFocusHistory;
window.filterTasks = filterTasks;
window.sortTasks = sortTasks;
window.filterSchedule = filterSchedule;
window.startFocusSession = startFocusSession;
window.startCustomFocusSession = startCustomFocusSession;
window.pauseFocusSession = pauseFocusSession;
window.stopFocusSession = stopFocusSession;
window.copySnippet = copySnippet;
window.toggleScheduleComplete = toggleScheduleComplete;
window.setPomodoroMode = setPomodoroMode;
window.startPomodoro = startPomodoro;
window.pausePomodoro = pausePomodoro;
window.resetPomodoro = resetPomodoro;
window.startStopwatch = startStopwatch;
window.pauseStopwatch = pauseStopwatch;
window.resetStopwatch = resetStopwatch;
window.startCountdown = startCountdown;
window.resetCountdown = resetCountdown;
window.filterResources = filterResources;
window.showResourceEditor = showResourceEditor;
window.resetResourceFilters = resetResourceFilters;
window.initTechNews = initTechNews;
window.filterNewsByCategory = filterNewsByCategory;
window.initTechEvents = initTechEvents;
window.filterEventsByType = filterEventsByType;
window.filterEventsByTime = filterEventsByTime;

// Start the application
document.addEventListener('DOMContentLoaded', initApp);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}
