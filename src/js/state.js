export const appData = {
    notes: [],
    tasks: [],
    snippets: [],
    schedule: [],
    resources: [],
    currentView: 'dashboard',
    theme: 'light',
    userProfile: {
        name: '',
        email: '',
        bio: '',
        goal: '',
        skills: [],
        avatarIcon: 'fa-user'
    },
    focusMode: {
        streak: 0,
        minutesToday: 0,
        weeklyHours: 0,
        totalSessions: 0,
        lastSessionDate: null,
        sessions: []
    },
    productivity: {
        dailyGoal: 8,
        weeklyGoal: 40,
        completedToday: 0,
        completedThisWeek: 0,
        history: []
    },
    settings: {
        autoSave: true,
        notifications: true,
        soundEffects: true,
        compactMode: false,
        showCompleted: true
    },
    searchHistory: [],
    recentFiles: [],
    bookmarks: [],
    lastBackup: null,
    techNews: [],
    techEvents: []
};

export const quotes = [
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" }
];

export const DATA_EXPORT_VERSION = '1.0';
export const STORAGE_COLLECTIONS = ['notes', 'tasks', 'snippets', 'schedule'];
