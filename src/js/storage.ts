import { appData, DATA_EXPORT_VERSION, STORAGE_COLLECTIONS, AppData } from './state.ts';
import { ensureObject, showNotification } from './utils.ts';
import * as db from './db.ts';

export async function migrateFromLocalStorage(): Promise<void> {
  const collections = [...STORAGE_COLLECTIONS, 'settings', 'productivity', 'userProfile', 'focusMode', 'theme'];
  let migrated = false;

  for (const key of collections) {
    const legacyKey = key === 'theme' ? 'studyhub-theme' : (key.startsWith('aura-') ? key : `aura-${key}`);
    const data = localStorage.getItem(legacyKey);
    if (data) {
      try {
        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data; // Fallback for simple strings like theme
        }
        await db.setValue(key, 'current', parsed);
        localStorage.removeItem(legacyKey);
        migrated = true;
      } catch (e) {
        console.error(`Migration failed for ${key}:`, e);
      }
    }
  }

  if (migrated) {
    showNotification('Data migrated to modern storage', 'success', 3000);
  }
}

export async function loadAllData(): Promise<boolean> {
  try {
    const [notes, tasks, snippets, schedule, settings, productivity, userProfile, focusMode, theme, searchHistory, bookmarks] = await Promise.all([
      db.getValue('notes', 'current'),
      db.getValue('tasks', 'current'),
      db.getValue('snippets', 'current'),
      db.getValue('schedule', 'current'),
      db.getValue('settings', 'current'),
      db.getValue('productivity', 'current'),
      db.getValue('userProfile', 'current'),
      db.getValue('focusMode', 'current'),
      db.getValue('theme', 'current'),
      db.getValue('searchHistory', 'current'),
      db.getValue('bookmarks', 'current')
    ]);

    if (notes) appData.notes = notes;
    if (tasks) appData.tasks = tasks;
    if (snippets) appData.snippets = snippets;
    if (schedule) appData.schedule = schedule;
    if (settings) appData.settings = { ...appData.settings, ...settings };
    if (productivity) appData.productivity = { ...appData.productivity, ...productivity };
    if (userProfile) appData.userProfile = { ...appData.userProfile, ...userProfile };
    if (focusMode) appData.focusMode = { ...appData.focusMode, ...focusMode };
    if (theme) appData.theme = theme;
    if (searchHistory) appData.searchHistory = searchHistory;
    if (bookmarks) appData.bookmarks = bookmarks;

    return true;
  } catch (e) {
    console.error('Load error:', e);
    return false;
  }
}

export async function saveAllData(): Promise<void> {
  try {
    await Promise.all([
      db.setValue('notes', 'current', appData.notes),
      db.setValue('tasks', 'current', appData.tasks),
      db.setValue('snippets', 'current', appData.snippets),
      db.setValue('schedule', 'current', appData.schedule),
      db.setValue('settings', 'current', appData.settings),
      db.setValue('productivity', 'current', appData.productivity),
      db.setValue('userProfile', 'current', appData.userProfile),
      db.setValue('focusMode', 'current', appData.focusMode),
      db.setValue('theme', 'current', appData.theme),
      db.setValue('searchHistory', 'current', appData.searchHistory),
      db.setValue('bookmarks', 'current', appData.bookmarks),
      db.setValue('settings', 'last-save', new Date().toISOString())
    ]);
    showNotification('Data saved', 'success', 2000);
  } catch (e) {
    showNotification('Failed to save', 'error', 3000);
    console.error('Save error:', e);
  }
}

interface ImportValidation {
  valid: boolean;
  message?: string;
  data?: Partial<AppData>;
}

export function validateImportPayload(payload: any): ImportValidation {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Invalid backup format.' };
  }
  if (payload.version && payload.version !== DATA_EXPORT_VERSION) {
    return { valid: false, message: `Unsupported backup version ${payload.version}.` };
  }
  if (!payload.data || typeof payload.data !== 'object') {
    return { valid: false, message: 'Backup missing data section.' };
  }

  const normalized: Partial<AppData> = {
    userProfile: { ...appData.userProfile },
    focusMode: { ...appData.focusMode },
    productivity: { ...appData.productivity },
    settings: { ...appData.settings }
  };

  STORAGE_COLLECTIONS.forEach(collection => {
    const collectionValue = payload.data[collection];
    (normalized as any)[collection] = Array.isArray(collectionValue) ? collectionValue : [];
  });

  (normalized as any).userProfile = {
    ...normalized.userProfile,
    ...ensureObject(payload.data.userProfile)
  };
  (normalized as any).focusMode = {
    ...normalized.focusMode,
    ...ensureObject(payload.data.focusMode)
  };
  (normalized as any).productivity = {
    ...normalized.productivity,
    ...ensureObject(payload.data.productivity)
  };
  (normalized as any).settings = {
    ...normalized.settings,
    ...ensureObject(payload.data.settings)
  };

  return {
    valid: true,
    data: normalized
  };
}

export async function exportAllData(): Promise<void> {
  try {
    const payload = {
      version: DATA_EXPORT_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        notes: appData.notes,
        tasks: appData.tasks,
        snippets: appData.snippets,
        schedule: appData.schedule,
        settings: appData.settings,
        productivity: appData.productivity,
        userProfile: appData.userProfile,
        focusMode: appData.focusMode,
        theme: appData.theme,
        searchHistory: appData.searchHistory,
        bookmarks: appData.bookmarks
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Backup generated successfully', 'success', 3000);
  } catch (e) {
    showNotification('Failed to generate backup', 'error', 3000);
    console.error('Export error:', e);
  }
}

export async function importData(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string);
        const validation = validateImportPayload(payload);

        if (!validation.valid) {
          showNotification(validation.message || 'Invalid backup', 'error', 5000);
          return;
        }

        if (!confirm('This will overwrite all current data. Are you sure?')) {
          return;
        }

        // Update app state
        Object.assign(appData, validation.data);

        // Save to DB
        await saveAllData();

        showNotification('Data imported successfully. Reloading...', 'success', 3000);
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        showNotification('Invalid JSON file', 'error', 3000);
        console.error('Import parse error:', err);
      }
    };
    reader.readAsText(file);
  } catch (e) {
    showNotification('Failed to read file', 'error', 3000);
    console.error('Import error:', e);
  }
}

export async function clearAllData(): Promise<void> {
  if (!confirm('Are you ABSOLUTELY sure? All your notes, tasks, and settings will be permanently deleted.')) {
    return;
  }

  try {
    await db.clearDatabase();
    localStorage.clear();
    showNotification('All data cleared. Resetting...', 'success', 3000);
    setTimeout(() => window.location.reload(), 2000);
  } catch (e) {
    showNotification('Failed to clear data', 'error', 3000);
    console.error('Clear error:', e);
  }
}
