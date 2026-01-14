export const pomodoroState = {
    interval: null,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    mode: 'work',
    isActive: false,
    endTime: null,
    modes: {
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    }
};

export function setPomodoroMode(mode) {
    if (pomodoroState.isActive) {
        const confirmSwitch = confirm('Timer is running. Switch mode?');
        if (!confirmSwitch) return;
        pausePomodoro();
    }

    pomodoroState.mode = mode;
    pomodoroState.timeLeft = pomodoroState.modes[mode];
    pomodoroState.totalTime = pomodoroState.modes[mode];
    
    document.querySelectorAll('.pomodoro-modes button').forEach(btn => {
        btn.classList.remove('active-mode');
        btn.classList.add('btn-secondary');
    });
    const activeBtn = document.getElementById(`mode-${mode}`);
    if (activeBtn) {
        activeBtn.classList.add('active-mode');
        activeBtn.classList.remove('btn-secondary');
    }
    updatePomodoroDisplay();
}

export function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timeDisplay = document.getElementById('pomodoroTime');
    if (timeDisplay) timeDisplay.textContent = display;
    
    const progress = (pomodoroState.timeLeft / pomodoroState.totalTime) * 100;
    const progressBar = document.getElementById('pomodoroProgress');
    if (progressBar) progressBar.style.width = `${100 - progress}%`;
    
    document.title = `${display} - Aura`;
}

export function startPomodoro() {
    if (pomodoroState.isActive) return;
    
    pomodoroState.isActive = true;
    document.getElementById('startPomodoro')?.classList.add('hidden');
    document.getElementById('pausePomodoro')?.classList.remove('hidden');
    
    pomodoroState.interval = setInterval(() => {
        pomodoroState.timeLeft--;
        updatePomodoroDisplay();
        
        if (pomodoroState.timeLeft <= 0) {
            clearInterval(pomodoroState.interval);
            pomodoroState.isActive = false;
            handlePomodoroEnd();
        }
    }, 1000);
}

export function pausePomodoro() {
    pomodoroState.isActive = false;
    clearInterval(pomodoroState.interval);
    document.getElementById('startPomodoro')?.classList.remove('hidden');
    document.getElementById('pausePomodoro')?.classList.add('hidden');
}

export function resetPomodoro() {
    pausePomodoro();
    pomodoroState.timeLeft = pomodoroState.modes[pomodoroState.mode];
    updatePomodoroDisplay();
}

function handlePomodoroEnd() {
    // Play sound if enabled
    // Show notification
    alert('Time is up!');
    resetPomodoro();
}
