import { appData } from './state.ts';
import { saveAllData } from './storage.ts';
import { showNotification } from './utils.ts';
import { renderTasks } from './tasks.ts';

export function initSettingsUI(): void {
  const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
  if (themeSelect) {
    themeSelect.value = appData.theme || 'light';
  }

  const toggleMappings: Record<string, keyof typeof appData.settings> = {
    autoSaveToggle: 'autoSave',
    notificationsToggle: 'notifications',
    soundEffectsToggle: 'soundEffects',
    compactModeToggle: 'compactMode',
    showCompletedToggle: 'showCompleted'
  };

  for (const [id, key] of Object.entries(toggleMappings)) {
    const toggle = document.getElementById(id);
    if (toggle) {
      if (appData.settings[key]) toggle.classList.add('active');
      else toggle.classList.remove('active');
    }
  }
}

export function changeTheme(theme: string): void {
  let appliedTheme = theme;
  if (theme === 'auto') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', appliedTheme);
  appData.theme = appliedTheme as 'light' | 'dark';
  saveAllData();

  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = appliedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  showNotification(`Theme changed to ${theme}`, 'success');
}

export function toggleSetting(setting: string): void {
  const settings = appData.settings as any;
  if (settings.hasOwnProperty(setting)) {
    settings[setting] = !settings[setting];

    const toggle = document.getElementById(`${setting}Toggle`);
    if (toggle) {
      toggle.classList.toggle('active', settings[setting]);
    }

    if (setting === 'compactMode') {
      document.body.classList.toggle('compact-mode', appData.settings.compactMode);
    } else if (setting === 'showCompleted') {
      renderTasks();
    }

    saveAllData();
    showNotification(`${setting} ${settings[setting] ? 'enabled' : 'disabled'}`, 'success');
  }
}

export function updateSettingsUI(): void {
  initSettingsUI();
}
