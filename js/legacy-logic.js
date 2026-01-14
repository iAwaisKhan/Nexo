import { appData, DATA_EXPORT_VERSION } from './state.js';
import { renderTasks } from './tasks.js';
import { updateDashboard } from './dashboard.js';
import { showNotification, ensureArray, ensureObject } from './utils.js';
import { saveAllData } from './storage.js';

// Global variables used by legacy logic
export let lenis;
export let autoSaveIntervalId = null;
export let stopwatchInterval = null;
export let stopwatchSeconds = 0;
export let countdownInterval = null;
export let countdownSeconds = 0;
export let focusInterval = null;
export let focusSecondsRemaining = 0;
export let focusSessionMinutes = 0;
export let focusStartTime = null;
export let focusPaused = false;
export let searchTimeout = null;

export function stopLenisScroll() {
    if (lenis) {
        lenis.stop();
        document.documentElement.classList.add('lenis-stopped');
    }
}

export function startLenisScroll() {
    if (lenis) {
        lenis.start();
        document.documentElement.classList.remove('lenis-stopped');
    }
}

export function toggleTaskComplete(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'Done' ? 'To Do' : 'Done';
        saveAllData();
        renderTasks();
        updateDashboard();
        updateProductivityStats();
        showNotification(task.status === 'Done' ? 'Task done!' : 'Task reopened', 'success', 2000);
    }
}

export function applyStaggerAnimation(container) {
    const animatableElements = container.querySelectorAll('.card, .note-card, .task-card, .snippet-card, .resource-card, .news-card, .event-card');
    
    animatableElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 25);
    });
}

export function changeTheme(theme) {
    let appliedTheme = theme;
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        appliedTheme = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', appliedTheme);
    appData.theme = appliedTheme;
    saveAllData();
    
    // Update toggle button icon and aria-label
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = appliedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    showToast(`Theme changed to ${theme === 'auto' ? 'Auto' : appliedTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'success');
}

export function toggleSetting(setting) {
    if (appData.settings.hasOwnProperty(setting)) {
        appData.settings[setting] = !appData.settings[setting];
        
        // Update toggle UI
        updateSettingsUI();
        
        // Apply setting effects
        applySettingEffect(setting);
        
        // Save settings
        saveAllData();
        
        const settingLabels = {
            autoSave: 'Auto Save',
            notifications: 'Notifications',
            soundEffects: 'Sound Effects',
            compactMode: 'Compact Mode',
            showCompleted: 'Show Completed'
        };
        
        showNotification(`${settingLabels[setting]} ${appData.settings[setting] ? 'enabled' : 'disabled'}`, 'success', 2000);
    }
}

export function applySettingEffect(setting) {
    switch (setting) {
        case 'compactMode':
            document.body.classList.toggle('compact-mode', appData.settings.compactMode);
            break;
        case 'showCompleted':
            renderTasks();
            break;
        case 'autoSave':
            applyAutoSaveSetting();
            break;
        case 'notifications':
            if (appData.settings.notifications) {
                initNotifications();
            }
            break;
    }
}

export function updateSettingsUI() {
    // Update all toggle switches based on current settings
    const toggleMappings = {
        autoSaveToggle: 'autoSave',
        notificationsToggle: 'notifications',
        soundEffectsToggle: 'soundEffects',
        compactModeToggle: 'compactMode',
        showCompletedToggle: 'showCompleted'
    };
    
    for (const [toggleId, settingKey] of Object.entries(toggleMappings)) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            if (appData.settings[settingKey]) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }
}

export function initSettingsUI() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('aura-settings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            appData.settings = { ...appData.settings, ...parsed };
        } catch (e) {
            console.error('Failed to parse settings:', e);
        }
    }
    
    // Apply initial settings
    updateSettingsUI();
    
    // Apply compact mode if enabled
    if (appData.settings.compactMode) {
        document.body.classList.add('compact-mode');
    }
}

export function clearAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL data? This action cannot be undone!')) {
        if (confirm('This will permanently delete all notes, tasks, snippets, and settings. Type "DELETE" to confirm.')) {
            // Clear all localStorage items
            localStorage.removeItem('aura-notes');
            localStorage.removeItem('aura-tasks');
            localStorage.removeItem('aura-snippets');
            localStorage.removeItem('aura-schedule');
            localStorage.removeItem('aura-settings');
            localStorage.removeItem('aura-productivity');
            localStorage.removeItem('aura-bookmarks');
            localStorage.removeItem('aura-search-history');
            
            // Reset appData to defaults
            appData.notes = [];
            appData.tasks = [];
            appData.snippets = [];
            appData.schedule = [];
            appData.bookmarks = [];
            appData.searchHistory = [];
            appData.settings = {
                autoSave: true,
                notifications: true,
                soundEffects: true,
                compactMode: false,
                showCompleted: true
            };
            
            // Re-render everything
            renderAll();
            updateDashboard();
            updateSettingsUI();
            
            showNotification('All data cleared', 'success', 3000);
        }
    }
}

export function refreshRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        updateRecentActivity();
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
    
    showToast('Activity refreshed', 'success');
}

export function updateCurrentTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        timeElement.textContent = `${displayHours}:${minutes} ${period}`;
    }
}

export function renderSchedule(filterDay = 'all') {
    const container = document.getElementById('scheduleContainer');
    let scheduleItems = appData.schedule;
    
    if (filterDay !== 'all') {
        scheduleItems = scheduleItems.filter(item => item.day === filterDay);
    }
    
    if (scheduleItems.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No schedule items for this day. Add one to get started!</p></div>';
        return;
    }
    
    // Group by day
    const groupedSchedule = scheduleItems.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {});
    
    container.innerHTML = Object.keys(groupedSchedule).map(day => {
        const safeDayLabel = escapeHTML(day);
        return `
            <div style="margin-bottom: var(--space-xl);">
                <h4 style="text-transform: capitalize; margin-bottom: var(--space-md); color: var(--accent);">
                    <i class="fas fa-calendar-day"></i> ${safeDayLabel}
                </h4>
                ${groupedSchedule[day].map(item => {
                    const safeTime = escapeHTML(item.time || '');
                    const safeSubject = escapeHTML(item.subject || '');
                    const safeDescription = escapeHTML(item.description || '');
                    const safeLocation = escapeHTML(item.location || '');
                    const safeItemDay = escapeHTML(item.day || '');
                    return `
                        <div class="schedule-item ${item.completed ? 'completed' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div class="schedule-time"><i class="fas fa-clock"></i> ${safeTime}</div>
                                    <div class="schedule-subject">${safeSubject}</div>
                                    <div class="schedule-description">${safeDescription}</div>
                                    <div style="display: flex; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
                                        <span style="font-size: 12px; color: var(--text-secondary);">
                                            <i class="fas fa-map-marker-alt"></i> ${safeLocation}
                                        </span>
                                        <span class="schedule-day-badge">${safeItemDay}</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: var(--space-sm);">
                                    <button class="btn btn-secondary ripple" onclick="toggleScheduleComplete(${item.id})" 
                                            style="padding: var(--space-sm) var(--space-md);">
                                        <i class="fas fa-${item.completed ? 'undo' : 'check'}"></i>
                                    </button>
                                    <button class="btn btn-secondary ripple" onclick="deleteScheduleItem(${item.id})" 
                                            style="padding: var(--space-sm) var(--space-md);">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

export function updateWeekOverview() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let totalItems = 0;
    
    days.forEach(day => {
        const dayItems = appData.schedule.filter(item => item.day === day);
        const count = dayItems.length;
        const completedCount = dayItems.filter(item => item.completed).length;
        
        totalItems += count;
        
        // Update day count
        const dayCountElement = document.querySelector(`.day-card[data-day="${day}"] .day-count`);
        if (dayCountElement) {
            dayCountElement.textContent = count;
            dayCountElement.style.opacity = count === 0 ? '0.5' : '1';
        }
        
        const completedElement = document.querySelector(`.day-card[data-day="${day}"] .day-completed`);
        if (completedElement) {
            completedElement.textContent = `✓ ${completedCount}`;
            completedElement.style.display = count > 0 ? 'inline-flex' : 'none';
        }
        
        const dayCard = document.querySelector(`.day-card[data-day="${day}"]`);
        if (dayCard) {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            dayCard.setAttribute('aria-label', `${dayName}: ${count} item${count !== 1 ? 's' : ''}, ${completedCount} completed`);
            if (count >= 5) {
                dayCard.classList.add('busy-day');
            } else {
                dayCard.classList.remove('busy-day');
            }
        }
    });
    
    const weekTotalElement = document.getElementById('weekTotal');
    if (weekTotalElement) {
        weekTotalElement.textContent = totalItems;
    }
}

export function resetResourceFilters() {
    const searchInput = document.getElementById('resourceSearch');
    const categorySelect = document.getElementById('resourceCategoryFilter');
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    
    renderResources();
    showToast('Filters reset', 'success');
}

export function bookmarkResource(id) {
    showToast('Resource bookmarked!', 'success');
}

export function completePomodoro() {
    clearInterval(pomodoroState.interval);
    pomodoroState.isActive = false;
    pomodoroState.interval = null;
    pomodoroState.timeLeft = 0;
    updatePomodoroDisplay();
    
    playNotificationSound();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Aura Pomodoro', {
            body: `${pomodoroState.mode === 'work' ? 'Focus session' : 'Break'} complete!`,
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>'
        });
    }
    
    if (pomodoroState.mode === 'work') {
        if (appData.focusMode) {
            appData.focusMode.minutesToday += pomodoroState.modes.work / 60;
            appData.focusMode.sessions.push({
                date: new Date().toISOString(),
                duration: pomodoroState.modes.work / 60
            });
            if (typeof saveFocusData === 'function') {
                saveFocusData();
            }
        }
    }
    
    showToast(`${pomodoroState.mode === 'work' ? 'Focus session' : 'Break'} complete!`, 'success');
}

export function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const display = document.getElementById('pomodoroDisplay');
    if (display) display.textContent = timeString;
    
    if (pomodoroState.isActive) {
        document.title = `${timeString} - ${pomodoroState.mode === 'work' ? 'Focus' : 'Break'} | Aura`;
    } else {
        document.title = 'Aura';
    }
}

export function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.error('Audio play failed', e);
    }
}

export function startStopwatch() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        stopwatchSeconds++;
        updateStopwatchDisplay();
    }, 1000);
}

export function pauseStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}

export function resetStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
}

export function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;
    document.getElementById('stopwatchDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function startCountdown() {
    const minutes = parseInt(document.getElementById('countdownMinutes').value) || 0;
    if (minutes <= 0) {
        showToast('Please enter valid minutes', 'error');
        return;
    }
    
    if (countdownInterval) clearInterval(countdownInterval);
    countdownSeconds = minutes * 60;
    
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            showToast('Countdown complete!', 'success');
        }
    }, 1000);
}

export function resetCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    countdownSeconds = 0;
    updateCountdownDisplay();
}

export function updateCountdownDisplay() {
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;
    document.getElementById('countdownDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const clockDisplay = document.getElementById('clockDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (clockDisplay) clockDisplay.textContent = timeString;
    if (dateDisplay) dateDisplay.textContent = dateString;
}

export function loadFocusData() {
    const saved = localStorage.getItem('aura-focus-data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appData.focusMode = { ...appData.focusMode, ...data };
            const today = new Date().toDateString();
            if (appData.focusMode.lastSessionDate !== today) {
                appData.focusMode.minutesToday = 0;
            }
            calculateWeeklyHours();
            updateFocusStats();
        } catch (e) {
            console.error('Error loading focus data:', e);
        }
    }
}

export function saveFocusData() {
    localStorage.setItem('aura-focus-data', JSON.stringify(appData.focusMode));
}

export function calculateWeeklyHours() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekSessions = appData.focusMode.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= oneWeekAgo;
    });
    const totalMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    appData.focusMode.weeklyHours = (totalMinutes / 60).toFixed(1);
}

export function updateFocusStats() {
    const streakEl = document.getElementById('focusStreak');
    const minutesEl = document.getElementById('minutesToday');
    const hoursEl = document.getElementById('weeklyHours');
    
    if (streakEl) animateStatValue('focusStreak', appData.focusMode.streak);
    if (minutesEl) animateStatValue('minutesToday', appData.focusMode.minutesToday);
    if (hoursEl) {
        hoursEl.textContent = appData.focusMode.weeklyHours;
        hoursEl.setAttribute('data-target', appData.focusMode.weeklyHours);
    }
}

export function startFocusSession(minutes) {
    if (focusInterval) {
        showToast('A focus session is already running!', 'error');
        return;
    }
    focusSessionMinutes = minutes;
    focusSecondsRemaining = minutes * 60;
    focusStartTime = new Date();
    focusPaused = false;
    showFocusModal();
    focusInterval = setInterval(() => {
        if (!focusPaused) {
            focusSecondsRemaining--;
            updateFocusDisplay();
            if (focusSecondsRemaining <= 0) {
                completeFocusSession();
            }
        }
    }, 1000);
    showToast(`${minutes} minute focus session started!`, 'success');
}

export function updateFocusDisplay() {
    const display = document.getElementById('focusTimerDisplay');
    if (!display) return;
    const minutes = Math.floor(focusSecondsRemaining / 60);
    const seconds = focusSecondsRemaining % 60;
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const totalSeconds = focusSessionMinutes * 60;
    const progress = ((totalSeconds - focusSecondsRemaining) / totalSeconds) * 100;
    const progressBar = document.getElementById('focusProgressBar');
    if (progressBar) progressBar.style.width = `${progress}%`;
}

export function pauseFocusSession() {
    if (!focusInterval) return;
    focusPaused = !focusPaused;
    const pauseBtn = document.querySelector('#focusPauseBtn i');
    const pauseText = document.querySelector('#focusPauseBtn span');
    if (focusPaused) {
        if (pauseBtn) pauseBtn.className = 'fas fa-play';
        if (pauseText) pauseText.textContent = 'Resume';
        showToast('Focus session paused', 'info');
    } else {
        if (pauseBtn) pauseBtn.className = 'fas fa-pause';
        if (pauseText) pauseText.textContent = 'Pause';
        showToast('Focus session resumed', 'success');
    }
}

export function stopFocusSession() {
    if (!focusInterval) return;
    if (confirm('Are you sure you want to end this focus session early?')) {
        const minutesCompleted = Math.floor((focusSessionMinutes * 60 - focusSecondsRemaining) / 60);
        if (minutesCompleted > 0) recordPartialSession(minutesCompleted);
        clearInterval(focusInterval);
        focusInterval = null;
        closeFocusModal();
        showToast(`Session ended. ${minutesCompleted} minutes completed.`, 'info');
    }
}

export function completeFocusSession() {
    clearInterval(focusInterval);
    focusInterval = null;
    const today = new Date().toDateString();
    appData.focusMode.minutesToday += focusSessionMinutes;
    appData.focusMode.totalSessions++;
    if (appData.focusMode.lastSessionDate === today) {
    } else if (isConsecutiveDay(appData.focusMode.lastSessionDate)) {
        appData.focusMode.streak++;
    } else {
        appData.focusMode.streak = 1;
    }
    appData.focusMode.lastSessionDate = today;
    appData.focusMode.sessions.push({
        date: new Date().toISOString(),
        duration: focusSessionMinutes,
        completed: true
    });
    if (appData.focusMode.sessions.length > 100) {
        appData.focusMode.sessions = appData.focusMode.sessions.slice(-100);
    }
    calculateWeeklyHours();
    saveFocusData();
    updateFocusStats();
    showFocusCompletionModal();
    closeFocusModal();
}

export function recordPartialSession(minutes) {
    const today = new Date().toDateString();
    appData.focusMode.minutesToday += minutes;
    appData.focusMode.lastSessionDate = today;
    appData.focusMode.sessions.push({
        date: new Date().toISOString(),
        duration: minutes,
        completed: false
    });
    calculateWeeklyHours();
    saveFocusData();
    updateFocusStats();
}

export function isConsecutiveDay(lastDateString) {
    if (!lastDateString) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return lastDateString === yesterday.toDateString();
}

export function showFocusModal() {
    const modal = document.getElementById('focusSessionModal');
    if (modal) {
        requestAnimationFrame(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            stopLenisScroll();
            updateFocusDisplay();
        });
    }
}

export function closeFocusModal() {
    const modal = document.getElementById('focusSessionModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            startLenisScroll();
        }, 300);
    }
}

export function showFocusCompletionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 500px;">
            <div style="font-size: 64px; margin: var(--space-24) 0;">🎉</div>
            <h2 style="margin-bottom: var(--space-16); color: var(--color-text);">Focus Session Complete!</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: var(--space-24); font-size: var(--font-size-lg);">
                Great job! You completed a ${focusSessionMinutes}-minute focus session.
            </p>
            <div class="stats-grid" style="margin-bottom: var(--space-24);">
                <div class="stat-card card">
                    <div class="stat-value">${appData.focusMode.streak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-card card">
                    <div class="stat-value">${appData.focusMode.minutesToday}</div>
                    <div class="stat-label">Minutes Today</div>
                </div>
            </div>
            <button class="btn ripple" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);" style="width: 100%;">
                <i class="fas fa-check"></i> Awesome!
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('active'));
    playSuccessSound();
    triggerConfetti();
}

export function playSuccessSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKjo77pjHwU7k9nzxnkqBSh+zPLaizsKG2S56+mmVRIJSKHh8bllHgU1ic/y1Ic1Bxptv/DinUwND1Cq6O+7Yh4FOpPY88p2KwUrfsvx3Is1CRxguur0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch (e) {}
}

export function triggerConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.backgroundColor = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function filterSchedule(day) {
    try {
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
        });
        if (day && day !== 'all') {
            const selectedCard = document.querySelector(`.day-card[data-day="${day}"]`);
            if (selectedCard) {
                selectedCard.classList.add('active');
                selectedCard.setAttribute('aria-pressed', 'true');
                const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                showToast(`Viewing ${dayName}'s schedule`, 'success');
            }
        } else {
            showToast('Viewing all days', 'success');
        }
        renderSchedule(day);
    } catch (error) {
        console.error('Error filtering schedule:', error);
        showToast('Error filtering schedule. Please try again.', 'error');
    }
}

export function toggleScheduleComplete(id) {
    try {
        const item = appData.schedule.find(s => s.id === id);
        if (item) {
            item.completed = !item.completed;
            const filterValue = document.getElementById('scheduleFilter')?.value || 'all';
            renderSchedule(filterValue);
            updateWeekOverview();
            showToast(item.completed ? `✓ ${item.subject} completed!` : `${item.subject} marked as incomplete`, 'success');
        } else {
            throw new Error('Schedule item not found');
        }
    } catch (error) {
        console.error('Error toggling schedule item:', error);
        showToast('Error updating schedule item. Please try again.', 'error');
    }
}

export function deleteScheduleItem(id) {
    if (confirm('Are you sure you want to delete this schedule item?')) {
        appData.schedule = appData.schedule.filter(s => s.id !== id);
        renderSchedule(document.getElementById('scheduleFilter').value);
        updateWeekOverview();
        showToast('Schedule item deleted', 'success');
    }
}

export function setupDayCardListeners() {
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const scheduleFilter = document.getElementById('scheduleFilter');
            if (scheduleFilter) scheduleFilter.value = day;
            filterSchedule(day);
            const scheduleContainer = document.getElementById('scheduleContainer');
            if (scheduleContainer) scheduleContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        card.addEventListener('keydown', function(e) {
            const cards = Array.from(document.querySelectorAll('.day-card'));
            const currentIndex = cards.indexOf(this);
            let targetIndex;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                targetIndex = (currentIndex + 1) % cards.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                targetIndex = (currentIndex - 1 + cards.length) % cards.length;
            }
            if (targetIndex !== undefined) {
                e.preventDefault();
                cards[targetIndex].focus();
            }
        });
    });
}

export function showNoteEditor() { showToast('Note editor opening...', 'success'); }
export function showTaskEditor() { showToast('Task editor opening...', 'success'); }
export function showSnippetEditor() { showToast('Snippet editor opening...', 'success'); }
export function showScheduleEditor() { showToast('Schedule editor opening...', 'success'); }
export function showResourceEditor() { showToast('Resource editor opening...', 'success'); }

export function startCustomFocusSession() {
    const input = document.getElementById('customFocusMinutes');
    const minutes = parseInt(input?.value);
    if (!minutes || minutes < 1) {
        showToast('Please enter a valid duration (1-180 minutes)', 'error');
        return;
    }
    if (minutes > 180) {
        showToast('Maximum session duration is 180 minutes', 'error');
        return;
    }
    startFocusSession(minutes);
    if (input) input.value = '';
}

export function viewFocusHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const recentSessions = appData.focusMode.sessions.slice(-10).reverse();
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Focus History</h2>
                <button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${recentSessions.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No focus sessions yet. Start your first session!</p>
                    </div>
                ` : `
                    <div style="margin-bottom: var(--space-lg);">
                        <h3 style="margin-bottom: var(--space-md);">Recent Sessions</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                            ${recentSessions.map(session => {
                                const date = new Date(session.date);
                                const dateStr = date.toLocaleDateString();
                                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return `
                                    <div class="card" style="padding: var(--space-16);">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-weight: var(--font-weight-medium); margin-bottom: var(--space-4);">
                                                    ${session.duration} minutes
                                                    ${session.completed ? '<i class="fas fa-check-circle" style="color: var(--color-success); margin-left: var(--space-4);"></i>' : '<i class="fas fa-clock" style="color: var(--color-warning); margin-left: var(--space-4);"></i>'}
                                                </div>
                                                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                                    ${dateStr} at ${timeStr}
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <span class="tag" style="background: ${session.completed ? 'var(--color-success)' : 'var(--color-warning)'}15; color: ${session.completed ? 'var(--color-success)' : 'var(--color-warning)'}; border: 1px solid currentColor;">
                                                    ${session.completed ? 'Completed' : 'Partial'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('active'));
}

export function updateTotalSessions() {
    const element = document.getElementById('totalSessions');
    if (element) {
        element.textContent = appData.focusMode.totalSessions;
    }
}

export class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = 2 + Math.random() * 1.5;
        this.phase = Math.random() * Math.PI * 2;
        this.amplitude = 0.3 + Math.random() * 0.2;
    }
    update(canvas) {
        this.phase += 0.01;
        this.x += this.vx + Math.sin(this.phase) * this.amplitude * 0.1;
        this.y += this.vy + Math.cos(this.phase * 0.7) * this.amplitude * 0.1;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    draw(ctx, getParticleColor) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor();
        ctx.fill();
    }
}

export function openUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (!modal) return;
    loadUserProfile();
    requestAnimationFrame(() => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    setTimeout(() => {
        document.getElementById('userName')?.focus();
    }, 100);
}

export function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 300);
}

export function loadUserProfile() {
    const savedProfile = localStorage.getItem('aura-user-profile');
    if (savedProfile) {
        try {
            appData.userProfile = JSON.parse(savedProfile);
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }
    document.getElementById('userName').value = appData.userProfile.name || '';
    document.getElementById('userEmail').value = appData.userProfile.email || '';
    document.getElementById('userBio').value = appData.userProfile.bio || '';
    document.getElementById('userGoal').value = appData.userProfile.goal || '';
    document.getElementById('userSkills').value = appData.userProfile.skills.join(', ') || '';
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (avatarIcon) avatarIcon.className = `fas ${appData.userProfile.avatarIcon}`;
}

export function saveUserProfile(event) {
    event.preventDefault();
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const bio = document.getElementById('userBio').value.trim();
    const goal = document.getElementById('userGoal').value.trim();
    const skillsInput = document.getElementById('userSkills').value.trim();
    const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(s => s) : [];
    if (!name) { showToast('Please enter your name', 'error'); return; }
    if (!email) { showToast('Please enter your email', 'error'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showToast('Please enter a valid email address', 'error'); return; }
    appData.userProfile = { ...appData.userProfile, name, email, bio, goal, skills };
    localStorage.setItem('aura-user-profile', JSON.stringify(appData.userProfile));
    updateUserGreeting();
    closeUserProfile();
    showToast('Profile updated successfully!', 'success');
}

export function updateUserGreeting() {
    if (appData.userProfile.name) {
        const greetingElement = document.getElementById('greetingText');
        if (greetingElement) {
            const hour = new Date().getHours();
            let greeting;
            if (hour >= 5 && hour < 12) greeting = 'Good morning';
            else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
            else if (hour >= 17 && hour < 22) greeting = 'Good evening';
            else greeting = 'Welcome back';
            greetingElement.textContent = `${greeting}, ${appData.userProfile.name.split(' ')[0]}`;
        }
    }
}

export function changeAvatar() {
    const avatarIcons = ['fa-user', 'fa-user-circle', 'fa-user-astronaut', 'fa-user-ninja', 'fa-user-graduate', 'fa-user-tie', 'fa-smile', 'fa-grin', 'fa-laugh', 'fa-grin-stars'];
    const currentIndex = avatarIcons.indexOf(appData.userProfile.avatarIcon);
    const nextIndex = (currentIndex + 1) % avatarIcons.length;
    appData.userProfile.avatarIcon = avatarIcons[nextIndex];
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (avatarIcon) avatarIcon.className = `fas ${appData.userProfile.avatarIcon}`;
    const headerAvatar = document.querySelector('#userAvatar i');
    if (headerAvatar) headerAvatar.className = `fas ${appData.userProfile.avatarIcon}`;
    showToast('Avatar updated!', 'success');
}

export function initKeyboardShortcuts() {
    const shortcuts = {
        'ctrl+n': () => { switchView('notes'); showNoteEditor(); },
        'ctrl+t': () => { switchView('tasks'); showTaskEditor(); },
        'ctrl+k': () => document.getElementById('globalSearch').focus(),
        'ctrl+s': () => saveAllData(),
        'ctrl+b': () => exportAllData(),
        'ctrl+/': () => showShortcutsModal(),
        'ctrl+1': () => switchView('dashboard'),
        'ctrl+2': () => switchView('notes'),
        'ctrl+3': () => switchView('tasks'),
        'ctrl+4': () => switchView('snippets'),
        'ctrl+5': () => switchView('planner'),
        'ctrl+f': () => switchView('focus'),
        'escape': () => closeAllModals()
    };
    document.addEventListener('keydown', (e) => {
        const key = (e.ctrlKey ? 'ctrl+' : '') + (e.shiftKey ? 'shift+' : '') + e.key.toLowerCase();
        if (shortcuts[key]) { e.preventDefault(); shortcuts[key](); }
    });
}

export function showShortcutsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>⌨️ Keyboard Shortcuts</h2>
                <button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: var(--space-12);">
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>N</kbd><span>New Note</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>T</kbd><span>New Task</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>K</kbd><span>Focus Search</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>S</kbd><span>Save All</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>B</kbd><span>Export Backup</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>/</kbd><span>Show Shortcuts</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>1-5</kbd><span>Quick Navigation</span></div>
                    <div class="shortcut-item"><kbd>Ctrl</kbd> + <kbd>F</kbd><span>Focus Mode</span></div>
                    <div class="shortcut-item"><kbd>Esc</kbd><span>Close Modal</span></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

export function initAutoSave() { applyAutoSaveSetting(); }

export function applyAutoSaveSetting() {
    if (autoSaveIntervalId) { clearInterval(autoSaveIntervalId); autoSaveIntervalId = null; }
    if (appData.settings.autoSave) {
        autoSaveIntervalId = setInterval(() => {
            saveAllData();
            showNotification('Auto-saved', 'success', 2000);
        }, 120000);
    }
}

export function saveAllData() {
    try {
        localStorage.setItem('aura-notes', JSON.stringify(appData.notes));
        localStorage.setItem('aura-tasks', JSON.stringify(appData.tasks));
        localStorage.setItem('aura-snippets', JSON.stringify(appData.snippets));
        localStorage.setItem('aura-schedule', JSON.stringify(appData.schedule));
        localStorage.setItem('aura-settings', JSON.stringify(appData.settings));
        localStorage.setItem('aura-productivity', JSON.stringify(appData.productivity));
        localStorage.setItem('aura-last-save', new Date().toISOString());
        showNotification('Data saved', 'success', 2000);
    } catch (e) {
        showNotification('Failed to save', 'error', 3000);
        console.error('Save error:', e);
    }
}

export function exportAllData() {
    const exportData = {
        version: DATA_EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        data: {
            notes: appData.notes,
            tasks: appData.tasks,
            snippets: appData.snippets,
            schedule: appData.schedule,
            userProfile: appData.userProfile,
            focusMode: appData.focusMode,
            productivity: appData.productivity,
            settings: appData.settings
        }
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    appData.lastBackup = new Date().toISOString();
    localStorage.setItem('aura-last-backup', appData.lastBackup);
    showNotification('Data exported!', 'success', 3000);
}

export function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                const validation = validateImportPayload(importedData);
                if (!validation.valid) { showNotification(validation.message, 'error', 3000); return; }
                if (confirm('⚠️ This will replace all current data. Continue?')) { applyImportedBackup(validation.data); }
            } catch (error) {
                showNotification('❌ Invalid file format', 'error', 3000);
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

export function applyImportedBackup(data, options = {}) {
    const { persistChanges = true, skipNotifications = false } = options;
    if (!data) return;
    appData.notes = ensureArray(data.notes);
    appData.tasks = ensureArray(data.tasks);
    appData.snippets = ensureArray(data.snippets);
    appData.schedule = ensureArray(data.schedule);
    appData.userProfile = ensureObject(data.userProfile, appData.userProfile);
    appData.focusMode = ensureObject(data.focusMode, appData.focusMode);
    appData.productivity = ensureObject(data.productivity, appData.productivity);
    appData.settings = ensureObject(data.settings, appData.settings);
    if (persistChanges) saveAllData();
    renderAll();
    updateDashboard();
    updateSettingsUI();
    applyAutoSaveSetting();
    if (!skipNotifications) showNotification('✅ Data imported successfully!', 'success', 3000);
}

export function createSampleBackupPayload(version = DATA_EXPORT_VERSION) {
    return {
        version,
        data: {
            notes: [{ id: 901, title: 'Backup note', content: 'Imported test note', tags: ['backup', 'test'] }],
            tasks: [{ id: 901, title: 'Backup task', description: 'Imported task', status: 'To Do', priority: 'Medium', dueDate: '2026-01-15' }],
            snippets: [{ id: 901, title: 'Backup snippet', language: 'JavaScript', code: 'console.log("Import test");' }],
            schedule: [{ id: 901, day: 'monday', time: '10:30 AM', subject: 'Imported backup review', description: 'Validate backup workflow', location: 'Lab', completed: false }],
            userProfile: { name: 'Import Tester', email: 'tester@example.com', bio: 'Validating imports', goal: 'Keep data consistent', skills: ['testing'], avatarIcon: 'fa-user-shield' },
            focusMode: { streak: 2, minutesToday: 25, weeklyHours: 4, totalSessions: 5, lastSessionDate: new Date().toISOString(), sessions: [] },
            productivity: { dailyGoal: 5, weeklyGoal: 30, completedToday: 2, completedThisWeek: 8, history: [] },
            settings: { autoSave: true, notifications: true, soundEffects: true, compactMode: false, showCompleted: true }
        }
    };
}

export const importBackupTestCases = [
    { label: 'Valid backup', raw: JSON.stringify(createSampleBackupPayload()), expectValid: true },
    { label: 'Version mismatch backup', raw: JSON.stringify(createSampleBackupPayload('0.9')), expectValid: false },
    { label: 'Corrupted backup', raw: '{ "version": "1.0", "data": { invalid json }', expectParseError: true }
];

export function runImportBackupTests() {
    console.group('Import backup validation tests');
    const snapshot = JSON.parse(JSON.stringify(appData));
    try {
        importBackupTestCases.forEach(test => {
            console.group(test.label);
            if (test.expectParseError) {
                try { JSON.parse(test.raw); console.error('Expected JSON.parse to fail'); } catch (error) { console.log('Corrupted backup rejected'); }
            } else {
                const parsed = JSON.parse(test.raw);
                const validation = validateImportPayload(parsed);
                console.log('Validation result:', validation.valid);
                if (validation.valid) {
                    applyImportedBackup(validation.data, { persistChanges: false, skipNotifications: true });
                    console.log('Auto-save interval active:', Boolean(autoSaveIntervalId));
                }
            }
            console.groupEnd();
        });
    } catch (error) { console.error('Tests failed', error); } finally {
        Object.keys(snapshot).forEach(key => appData[key] = snapshot[key]);
        applyAutoSaveSetting();
        console.groupEnd();
    }
}

export function addToSearchHistory(query) {
    if (!appData.searchHistory.includes(query)) {
        appData.searchHistory.unshift(query);
        if (appData.searchHistory.length > 10) appData.searchHistory = appData.searchHistory.slice(0, 10);
        localStorage.setItem('aura-search-history', JSON.stringify(appData.searchHistory));
    }
}

export function performGlobalSearch(query) {
    const results = {
        notes: appData.notes.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query) || n.tags.some(t => t.toLowerCase().includes(query))),
        tasks: appData.tasks.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)),
        snippets: appData.snippets.filter(s => s.title.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)),
        resources: appData.resources.filter(r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query) || r.tags.some(t => t.toLowerCase().includes(query)))
    };
    showSearchResults(results, query);
}

export function showSearchResults(results, query) {
    const totalResults = results.notes.length + results.tasks.length + results.snippets.length + results.resources.length;
    if (totalResults === 0) { showNotification(`No results found for "${query}"`, 'info', 2000); return; }
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
            <div class="modal-header">
                <h2>🔍 Search Results for "${query}"</h2>
                <button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="overflow-y: auto;">
                <p style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Found ${totalResults} result${totalResults !== 1 ? 's' : ''}</p>
                ${results.notes.length > 0 ? `<div><h3>📝 Notes (${results.notes.length})</h3><div>${results.notes.map(note => `<div class="card" onclick="switchView('notes'); this.closest('.modal').remove();"><h4>${escapeHTML(note.title)}</h4><p>${escapeHTML(note.content.substring(0, 100))}...</p></div>`).join('')}</div></div>` : ''}
                ${results.tasks.length > 0 ? `<div><h3>✅ Tasks (${results.tasks.length})</h3><div>${results.tasks.map(task => `<div class="card" onclick="switchView('tasks'); this.closest('.modal').remove();"><h4>${escapeHTML(task.title)}</h4><p>${escapeHTML(task.description)}</p></div>`).join('')}</div></div>` : ''}
                ${results.snippets.length > 0 ? `<div><h3>💻 Snippets (${results.snippets.length})</h3><div>${results.snippets.map(snippet => `<div class="card" onclick="switchView('snippets'); this.closest('.modal').remove();"><h4>${escapeHTML(snippet.title)}</h4><span class="tag">${escapeHTML(snippet.language)}</span></div>`).join('')}</div></div>` : ''}
                ${results.resources.length > 0 ? `<div><h3>📚 Resources (${results.resources.length})</h3><div>${results.resources.map(resource => `<div class="card" onclick="window.open('${escapeForSingleQuote(resource.url)}', '_blank'); this.closest('.modal').remove();"><h4>${escapeHTML(resource.title)}</h4><p>${escapeHTML(resource.description)}</p></div>`).join('')}</div></div>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

export function updateProductivityStats() {
    const today = new Date().toDateString();
    const completedTasks = appData.tasks.filter(t => t.status === 'Done').length;
    const totalTasks = appData.tasks.length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;
    appData.productivity.completedToday = completedTasks;
    appData.productivity.completionRate = completionRate;
    const existingEntry = appData.productivity.history.find(h => h.date === today);
    if (existingEntry) { existingEntry.completed = completedTasks; existingEntry.total = totalTasks; }
    else {
        appData.productivity.history.push({ date: today, completed: completedTasks, total: totalTasks, focusMinutes: appData.focusMode.minutesToday });
        if (appData.productivity.history.length > 30) appData.productivity.history = appData.productivity.history.slice(-30);
    }
    localStorage.setItem('aura-productivity', JSON.stringify(appData.productivity));
}

export function showProductivityReport() {
    const last7Days = appData.productivity.history.slice(-7);
    const avgCompletion = last7Days.length > 0 ? (last7Days.reduce((sum, day) => sum + (day.completed / Math.max(day.total, 1)), 0) / last7Days.length * 100).toFixed(0) : 0;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header"><h2>Productivity Report</h2><button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);"><i class="fas fa-times"></i></button></div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card card"><div class="stat-value">${appData.tasks.filter(t => t.status === 'Done').length}</div><div class="stat-label">Tasks Completed</div></div>
                    <div class="stat-card card"><div class="stat-value">${avgCompletion}%</div><div class="stat-label">7-Day Average</div></div>
                    <div class="stat-card card"><div class="stat-value">${appData.focusMode.totalSessions}</div><div class="stat-label">Focus Sessions</div></div>
                    <div class="stat-card card"><div class="stat-value">${appData.focusMode.streak}</div><div class="stat-label">Day Streak</div></div>
                </div>
                <h3>Last 7 Days</h3>
                <div>${last7Days.map(day => `<div><span>${new Date(day.date).toLocaleDateString()}</span><span>${day.completed} / ${day.total} tasks</span><span>${day.focusMinutes} min focus</span></div>`).join('')}</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

export function initNotifications() { if ('Notification' in window && appData.settings.notifications) { if (Notification.permission === 'default') Notification.requestPermission(); } }

export function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => toast.remove(), 300); }, duration);
}

export function filterTasks(filter) {
    let filtered = [...appData.tasks];
    switch(filter) {
        case 'active': filtered = filtered.filter(t => t.status !== 'Done'); break;
        case 'completed': filtered = filtered.filter(t => t.status === 'Done'); break;
        case 'high': filtered = filtered.filter(t => t.priority === 'High'); break;
        case 'today': const today = new Date().toISOString().split('T')[0]; filtered = filtered.filter(t => t.dueDate === today); break;
    }
    renderTasks(filtered);
}

export function sortTasks(sortBy) {
    let sorted = [...appData.tasks];
    switch(sortBy) {
        case 'priority': const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 }; sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]); break;
        case 'dueDate': sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); break;
        case 'status': sorted.sort((a, b) => a.status.localeCompare(b.status)); break;
    }
    renderTasks(sorted);
}

export function selectAllTasks() { document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = true); }

export function deleteSelectedTasks() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    if (checkboxes.length === 0) { showNotification('No tasks selected', 'info', 2000); return; }
    if (confirm(`Delete ${checkboxes.length} selected task(s)?`)) {
        checkboxes.forEach(cb => {
            const taskId = parseInt(cb.dataset.taskId);
            const index = appData.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) appData.tasks.splice(index, 1);
        });
        saveAllData(); renderTasks(); updateDashboard(); showNotification(`${checkboxes.length} task(s) deleted`, 'success', 2000);
    }
}

export function markSelectedTasksComplete() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    if (checkboxes.length === 0) { showNotification('No tasks selected', 'info', 2000); return; }
    checkboxes.forEach(cb => {
        const taskId = parseInt(cb.dataset.taskId);
        const task = appData.tasks.find(t => t.id === taskId);
        if (task) task.status = 'Done';
    });
    saveAllData(); renderTasks(); updateDashboard(); updateProductivityStats(); showNotification(`${checkboxes.length} task(s) marked complete`, 'success', 2000);
}

export function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => { modal.remove(); document.body.style.overflow = 'auto'; }, 300);
    });
}

export function initTechNews() {
    appData.techNews = [
        { id: 1, title: "AI Breakthrough: New Language Model Surpasses GPT-4", source: "TechCrunch", date: "2025-11-24", category: "AI/ML", url: "https://techcrunch.com", image: "https://via.placeholder.com/400x250/32808d/ffffff?text=AI+News", summary: "Researchers announce a groundbreaking AI model with enhanced reasoning capabilities.", tags: ["AI", "Machine Learning", "GPT"] },
        { id: 2, title: "JavaScript Framework Wars: The Rise of New Contenders", source: "Dev.to", date: "2025-11-23", category: "Web Dev", url: "https://dev.to", image: "https://via.placeholder.com/400x250/21808d/ffffff?text=JavaScript", summary: "New lightweight frameworks are challenging React and Vue's dominance.", tags: ["JavaScript", "Frameworks", "Web Development"] },
        { id: 3, title: "Quantum Computing Achieves Major Milestone", source: "MIT Technology Review", date: "2025-11-22", category: "Computing", url: "https://technologyreview.com", image: "https://via.placeholder.com/400x250/1d6c78/ffffff?text=Quantum", summary: "Scientists demonstrate practical quantum advantage.", tags: ["Quantum", "Computing", "Science"] },
        { id: 4, title: "Cybersecurity Alert: New Zero-Day Vulnerability Discovered", source: "The Hacker News", date: "2025-11-21", category: "Security", url: "https://thehackernews.com", image: "https://via.placeholder.com/400x250/195c66/ffffff?text=Security", summary: "Critical vulnerability affects millions of devices.", tags: ["Security", "Vulnerability", "Cybersecurity"] },
        { id: 5, title: "Web3 Revolution: Decentralized Apps Go Mainstream", source: "CoinDesk", date: "2025-11-20", category: "Blockchain", url: "https://coindesk.com", image: "https://via.placeholder.com/400x250/154c54/ffffff?text=Web3", summary: "Major companies are integrating blockchain technology.", tags: ["Web3", "Blockchain", "DApps"] },
        { id: 6, title: "5G Networks Enable Revolutionary IoT Applications", source: "Wired", date: "2025-11-19", category: "IoT", url: "https://wired.com", image: "https://via.placeholder.com/400x250/0f3c42/ffffff?text=5G+IoT", summary: "Next-generation connectivity is powering smart cities.", tags: ["5G", "IoT", "Connectivity"] },
        { id: 7, title: "Open Source AI Models Challenge Proprietary Giants", source: "GitHub Blog", date: "2025-11-18", category: "Open Source", url: "https://github.blog", image: "https://via.placeholder.com/400x250/32808d/ffffff?text=Open+Source", summary: "Community-driven AI projects are democratizing access.", tags: ["Open Source", "AI", "Community"] },
        { id: 8, title: "Cloud Computing: Edge Computing Takes Center Stage", source: "AWS News", date: "2025-11-17", category: "Cloud", url: "https://aws.amazon.com/blogs", image: "https://via.placeholder.com/400x250/21808d/ffffff?text=Cloud", summary: "Edge computing solutions are reducing latency.", tags: ["Cloud", "Edge Computing", "Infrastructure"] }
    ];
    renderTechNews();
}

export function renderTechNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    if (appData.techNews.length === 0) { container.innerHTML = '<div class="empty-state">No tech news available.</div>'; return; }
    container.innerHTML = appData.techNews.map(news => `
        <div class="card news-card">
            <div class="news-image" style="background: url('${news.image}') center/cover;"></div>
            <div><span>${news.category}</span><span>${formatNewsDate(news.date)}</span></div>
            <h3>${news.title}</h3><p>${news.summary}</p>
            <div><span>${news.source}</span></div>
            <div>${news.tags.map(tag => `<span>#${tag}</span>`).join('')}</div>
            <div><button onclick="window.open('${news.url}', '_blank')">Read More</button></div>
        </div>
    `).join('');
}

export function formatNewsDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

export function shareNews(newsId) {
    const news = appData.techNews.find(n => n.id === newsId);
    if (!news) return;
    if (navigator.share) { navigator.share({ title: news.title, text: news.summary, url: news.url }); }
    else { copyToClipboard(news.url); }
}

export function bookmarkNews(newsId) {
    const news = appData.techNews.find(n => n.id === newsId);
    if (!news) return;
    if (!appData.bookmarks.find(b => b.type === 'news' && b.id === newsId)) {
        appData.bookmarks.push({ type: 'news', id: newsId, title: news.title, date: new Date().toISOString() });
        localStorage.setItem('aura-bookmarks', JSON.stringify(appData.bookmarks));
        showNotification('Bookmarked!', 'success', 2000);
    }
}

export function copyToClipboard(text) { navigator.clipboard.writeText(text).then(() => showNotification('Copied!', 'success', 2000)); }

export function filterNewsByCategory(category) {
    const filtered = category === 'all' ? appData.techNews : appData.techNews.filter(n => n.category === category);
    renderTechNews(filtered);
}

export function initTechEvents() {
    appData.techEvents = [
        { id: 1, title: "AI Summit 2025", date: "2025-12-15", endDate: "2025-12-17", location: "San Francisco, CA", type: "Conference", isVirtual: true, price: "Free", url: "https://aisummit2025.com", image: "https://via.placeholder.com/400x250/32808d/ffffff?text=AI+Summit", description: "Explore the future of artificial intelligence.", attendees: "5,000+", tags: ["AI", "ML", "Conference"] },
        { id: 2, title: "JavaScript World Conference", date: "2025-12-20", endDate: "2025-12-22", location: "Austin, TX", type: "Conference", isVirtual: false, price: "$299", url: "https://jsworld.com", image: "https://via.placeholder.com/400x250/21808d/ffffff?text=JS+World", description: "Three days of JS workshops.", attendees: "3,000+", tags: ["JavaScript", "Web Dev"] }
    ];
    renderTechEvents();
}

export function renderTechEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    const sortedEvents = [...appData.techEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    container.innerHTML = sortedEvents.map(event => `
        <div class="card event-card">
            <div class="event-image" style="background: url('${event.image}') center/cover;"></div>
            <h3>${event.title}</h3>
            <div><span>${formatEventDate(event.date, event.endDate)}</span></div>
            <p>${event.description}</p>
            <div><button onclick="window.open('${event.url}', '_blank')">Register Now</button></div>
        </div>
    `).join('');
}

export function formatEventDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate === endDate) return start.toLocaleDateString();
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

export function addEventToCalendar(eventId) {
    const event = appData.techEvents.find(e => e.id === eventId);
    if (!event) return;
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${startDate}\nSUMMARY:${event.title}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${event.title}.ics`; link.click();
    showNotification('Added to calendar!', 'success', 2000);
}

export function shareEvent(eventId) {
    const event = appData.techEvents.find(e => e.id === eventId);
    if (!event) return;
    const shareText = `Check out ${event.title}`;
    if (navigator.share) { navigator.share({ title: event.title, text: shareText, url: event.url }); }
    else { copyToClipboard(event.url); }
}

export function filterEventsByType(type) {
    const filtered = type === 'all' ? appData.techEvents : appData.techEvents.filter(e => e.type === type);
    renderFilteredEvents(filtered);
}

export function filterEventsByTime(timeFilter) {
    const now = new Date();
    let filtered = timeFilter === 'upcoming' ? appData.techEvents.filter(e => new Date(e.date) >= now) : appData.techEvents.filter(e => new Date(e.date) < now);
    renderFilteredEvents(filtered);
}

export function renderFilteredEvents(events) {
    // Shared rendering logic
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    container.innerHTML = events.map(event => `
        <div class="card event-card">
            <div class="event-image" style="background: url('${event.image}') center/cover;"></div>
            <h3>${event.title}</h3>
            <div><span>${formatEventDate(event.date, event.endDate)}</span></div>
            <p>${event.description}</p>
            <div><button onclick="window.open('${event.url}', '_blank')">Register Now</button></div>
        </div>
    `).join('');
}
