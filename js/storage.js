import { appData, DATA_EXPORT_VERSION, STORAGE_COLLECTIONS } from './state.js';
import { ensureObject, showNotification } from './utils.js';
import * as db from './db.js';

export async function migrateFromLocalStorage() {
    const collections = [...STORAGE_COLLECTIONS, 'settings', 'productivity', 'userProfile', 'focusMode', 'theme'];
    let migrated = false;

    for (const key of collections) {
        const legacyKey = key === 'theme' ? 'studyhub-theme' : (key.startsWith('aura-') ? key : `aura-${key}`);
        const data = localStorage.getItem(legacyKey);
        if (data) {
            try {
                let parsed;
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

export async function loadAllData() {
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

export async function saveAllData() {
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

export function validateImportPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, message: 'Invalid backup format.' };
    }
    if (payload.version && payload.version !== DATA_EXPORT_VERSION) {
        return { valid: false, message: `Unsupported backup version ${payload.version}.` };
    }
    if (!payload.data || typeof payload.data !== 'object') {
        return { valid: false, message: 'Backup missing data section.' };
    }

    const normalized = {
        userProfile: { ...appData.userProfile },
        focusMode: { ...appData.focusMode },
        productivity: { ...appData.productivity },
        settings: { ...appData.settings }
    };

    STORAGE_COLLECTIONS.forEach(collection => {
        const collectionValue = payload.data[collection];
        normalized[collection] = Array.isArray(collectionValue) ? collectionValue : [];
    });

    normalized.userProfile = {
        ...normalized.userProfile,
        ...ensureObject(payload.data.userProfile)
    };
    normalized.focusMode = {
        ...normalized.focusMode,
        ...ensureObject(payload.data.focusMode)
    };
    normalized.productivity = {
        ...normalized.productivity,
        ...ensureObject(payload.data.productivity)
    };
    normalized.settings = {
        ...normalized.settings,
        ...ensureObject(payload.data.settings)
    };

    return {
        valid: true,
        data: normalized
    };
}
