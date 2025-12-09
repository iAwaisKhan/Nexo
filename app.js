// smooth scroll lib
let lenis;

function initLenisScroll() {
    lenis = new Lenis({
        duration: 0.8,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
        smoothTouch: false,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.1
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

function stopLenisScroll() {
    if (lenis) {
        lenis.stop();
        document.documentElement.classList.add('lenis-stopped');
    }
}

function startLenisScroll() {
    if (lenis) {
        lenis.start();
        document.documentElement.classList.remove('lenis-stopped');
    }
}

const appData = {
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
    // New features
    productivity: {
        dailyGoal: 8, // hours
        weeklyGoal: 40, // hours
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

// Quotes
const quotes = [
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" }
];

function initTheme() {
    const savedTheme = localStorage.getItem('studyhub-theme');
    let theme = savedTheme || 'auto';
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    appData.theme = theme;
    
    // Update UI elements
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme || 'auto';
    }
}

function initApp() {
    initLenisScroll();
    initTheme();
    initSettingsUI();
    loadSampleData();
    setupEventListeners();
    updateDashboard();
    updateCurrentDate();
    startLiveClock();
    displayRandomQuote();
    renderAll();
    initNetworkAnimation();
    
    // Hide preloader with smooth transition
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            // Apply stagger animation to dashboard cards
            const dashboardView = document.querySelector('.view.active');
            if (dashboardView) {
                applyStaggerAnimation(dashboardView);
            }
        }, 1500);
    } else {
        // Fallback if no preloader
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
}

function loadSampleData() {
    appData.notes = [
        { id: 1, title: "JavaScript Basics", content: "Learn array methods: map, filter, reduce", tags: ["javascript", "programming"], category: "Study", created: new Date() },
        { id: 2, title: "Web Dev Projects", content: "Build portfolio, task manager, weather app", tags: ["projects", "web-dev"], category: "Project", created: new Date() }
    ];

    appData.tasks = [
        { id: 1, title: "Complete JavaScript assignment", description: "Build a todo list app", priority: "High", dueDate: "2025-11-20", status: "To Do" },
        { id: 2, title: "Read Chapter 5", description: "Data Structures chapter", priority: "Medium", dueDate: "2025-11-22", status: "In Progress" }
    ];

    appData.snippets = [
        { id: 1, title: "Fetch API", language: "JavaScript", code: "fetch('api/data').then(r => r.json())", tags: ["api", "fetch"] },
        { id: 2, title: "CSS Flexbox", language: "CSS", code: ".container { display: flex; justify-content: center; }", tags: ["css", "layout"] }
    ];

    appData.resources = [
        // Documentation & References
        { id: 1, title: "MDN Web Docs", url: "https://developer.mozilla.org", category: "Documentation", tags: ["html", "css", "javascript"], description: "Comprehensive web development documentation" },
        { id: 2, title: "W3Schools", url: "https://www.w3schools.com", category: "Documentation", tags: ["html", "css", "javascript", "sql"], description: "Easy-to-understand web tutorials" },
        { id: 3, title: "DevDocs", url: "https://devdocs.io", category: "Documentation", tags: ["api", "reference"], description: "All-in-one API documentation browser" },
        { id: 4, title: "Can I Use", url: "https://caniuse.com", category: "Tool", tags: ["browser", "compatibility"], description: "Browser support tables for web technologies" },
        
        // Free Courses & Tutorials
        { id: 5, title: "freeCodeCamp", url: "https://www.freecodecamp.org", category: "Course", tags: ["javascript", "python", "data-science"], description: "Free coding bootcamp with certifications" },
        { id: 6, title: "JavaScript30", url: "https://javascript30.com", category: "Course", tags: ["javascript", "projects"], description: "30 day vanilla JS coding challenge" },
        { id: 7, title: "The Odin Project", url: "https://www.theodinproject.com", category: "Course", tags: ["full-stack", "web-dev"], description: "Free full-stack curriculum" },
        { id: 8, title: "CS50", url: "https://cs50.harvard.edu", category: "Course", tags: ["computer-science", "fundamentals"], description: "Harvard's intro to computer science" },
        { id: 9, title: "Codecademy", url: "https://www.codecademy.com", category: "Course", tags: ["interactive", "multiple-languages"], description: "Interactive coding lessons" },
        { id: 10, title: "Khan Academy", url: "https://www.khanacademy.org/computing", category: "Course", tags: ["programming", "computer-science"], description: "Free CS courses for beginners" },
        
        // Practice & Challenges
        { id: 11, title: "LeetCode", url: "https://leetcode.com", category: "Practice", tags: ["algorithms", "interview-prep"], description: "Coding interview preparation platform" },
        { id: 12, title: "HackerRank", url: "https://www.hackerrank.com", category: "Practice", tags: ["algorithms", "challenges"], description: "Coding challenges and competitions" },
        { id: 13, title: "Codewars", url: "https://www.codewars.com", category: "Practice", tags: ["kata", "multiple-languages"], description: "Code challenges called kata" },
        { id: 14, title: "Exercism", url: "https://exercism.org", category: "Practice", tags: ["mentorship", "practice"], description: "Code practice with mentorship" },
        { id: 15, title: "Frontend Mentor", url: "https://www.frontendmentor.io", category: "Practice", tags: ["frontend", "projects"], description: "Real-world frontend challenges" },
        
        // YouTube Channels
        { id: 16, title: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", category: "Video", tags: ["web-dev", "tutorials"], description: "Web dev tutorials and crash courses" },
        { id: 17, title: "Fireship", url: "https://www.youtube.com/@Fireship", category: "Video", tags: ["quick-learn", "modern"], description: "Fast-paced modern dev tutorials" },
        { id: 18, title: "Net Ninja", url: "https://www.youtube.com/@NetNinja", category: "Video", tags: ["web-dev", "series"], description: "In-depth web development series" },
        { id: 19, title: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified", category: "Video", tags: ["javascript", "tutorials"], description: "Simplified web development concepts" },
        { id: 20, title: "Kevin Powell", url: "https://www.youtube.com/@KevinPowell", category: "Video", tags: ["css", "design"], description: "CSS expert tutorials" },
        
        // Tools & Resources
        { id: 21, title: "GitHub", url: "https://github.com", category: "Tool", tags: ["version-control", "collaboration"], description: "Code hosting and collaboration platform" },
        { id: 22, title: "Stack Overflow", url: "https://stackoverflow.com", category: "Community", tags: ["q&a", "help"], description: "Q&A community for developers" },
        { id: 23, title: "CodePen", url: "https://codepen.io", category: "Tool", tags: ["frontend", "sandbox"], description: "Online code editor and playground" },
        { id: 24, title: "Replit", url: "https://replit.com", category: "Tool", tags: ["ide", "collaboration"], description: "Online collaborative IDE" },
        { id: 25, title: "Regex101", url: "https://regex101.com", category: "Tool", tags: ["regex", "testing"], description: "Regular expression tester" },
        
        // Design & UI/UX
        { id: 26, title: "Dribbble", url: "https://dribbble.com", category: "Design", tags: ["inspiration", "ui"], description: "Design inspiration community" },
        { id: 27, title: "Figma", url: "https://www.figma.com", category: "Tool", tags: ["design", "prototyping"], description: "Collaborative design tool" },
        { id: 28, title: "Coolors", url: "https://coolors.co", category: "Tool", tags: ["color", "palette"], description: "Color palette generator" },
        { id: 29, title: "Google Fonts", url: "https://fonts.google.com", category: "Resource", tags: ["typography", "fonts"], description: "Free web fonts library" },
        { id: 30, title: "Font Awesome", url: "https://fontawesome.com", category: "Resource", tags: ["icons", "ui"], description: "Icon library and toolkit" },
        
        // Blogs & Articles
        { id: 31, title: "CSS-Tricks", url: "https://css-tricks.com", category: "Blog", tags: ["css", "frontend"], description: "Web design and development articles" },
        { id: 32, title: "Smashing Magazine", url: "https://www.smashingmagazine.com", category: "Blog", tags: ["web-design", "development"], description: "Professional web design magazine" },
        { id: 33, title: "Dev.to", url: "https://dev.to", category: "Community", tags: ["articles", "discussions"], description: "Developer blogging community" },
        { id: 34, title: "Medium - Programming", url: "https://medium.com/tag/programming", category: "Blog", tags: ["articles", "tutorials"], description: "Programming articles and stories" },
        
        // Cheat Sheets & Quick References
        { id: 35, title: "OverAPI", url: "https://overapi.com", category: "Reference", tags: ["cheatsheets", "quick-reference"], description: "Collecting all cheat sheets" },
        { id: 36, title: "Cheatography", url: "https://cheatography.com/programming", category: "Reference", tags: ["cheatsheets", "programming"], description: "Programming cheat sheets" },
        { id: 37, title: "Awesome Lists", url: "https://github.com/sindresorhus/awesome", category: "Resource", tags: ["curated", "lists"], description: "Curated lists of awesome resources" },
        
        // Specialized Learning
        { id: 38, title: "React Official Docs", url: "https://react.dev", category: "Documentation", tags: ["react", "javascript"], description: "Official React documentation" },
        { id: 39, title: "Vue.js Guide", url: "https://vuejs.org/guide", category: "Documentation", tags: ["vue", "javascript"], description: "Official Vue.js guide" },
        { id: 40, title: "Node.js Docs", url: "https://nodejs.org/docs", category: "Documentation", tags: ["nodejs", "backend"], description: "Official Node.js documentation" },
        { id: 41, title: "Python.org", url: "https://www.python.org", category: "Documentation", tags: ["python", "programming"], description: "Official Python documentation" },
        { id: 42, title: "Rust Book", url: "https://doc.rust-lang.org/book", category: "Documentation", tags: ["rust", "systems"], description: "The official Rust programming book" },
        
        // Career & Interview Prep
        { id: 43, title: "Pramp", url: "https://www.pramp.com", category: "Practice", tags: ["interview", "mock"], description: "Free mock interviews with peers" },
        { id: 44, title: "Interview Cake", url: "https://www.interviewcake.com", category: "Course", tags: ["interview", "algorithms"], description: "Programming interview preparation" },
        { id: 45, title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org", category: "Resource", tags: ["interview", "guide"], description: "Free curated interview preparation" },
        
        // Accessibility
        { id: 46, title: "WebAIM", url: "https://webaim.org", category: "Resource", tags: ["accessibility", "a11y"], description: "Web accessibility resources" },
        { id: 47, title: "A11y Project", url: "https://www.a11yproject.com", category: "Resource", tags: ["accessibility", "checklist"], description: "Community-driven accessibility resources" },
        
        // News & Updates
        { id: 48, title: "Hacker News", url: "https://news.ycombinator.com", category: "News", tags: ["tech", "startup"], description: "Tech and startup news" },
        { id: 49, title: "JavaScript Weekly", url: "https://javascriptweekly.com", category: "Newsletter", tags: ["javascript", "updates"], description: "Weekly JavaScript newsletter" },
        { id: 50, title: "CSS Weekly", url: "https://css-weekly.com", category: "Newsletter", tags: ["css", "updates"], description: "Weekly CSS newsletter" }
    ];

    appData.schedule = [
        { id: 1, day: "monday", time: "09:00 AM", subject: "Data Structures", description: "Arrays and Linked Lists", location: "Room 301", completed: false },
        { id: 2, day: "monday", time: "02:00 PM", subject: "Web Development", description: "React Hooks Practice", location: "Lab 2", completed: false },
        { id: 3, day: "tuesday", time: "10:00 AM", subject: "Algorithms", description: "Sorting Algorithms", location: "Room 205", completed: false },
        { id: 4, day: "wednesday", time: "11:00 AM", subject: "Database Systems", description: "SQL Queries", location: "Room 401", completed: false },
        { id: 5, day: "thursday", time: "01:00 PM", subject: "Computer Networks", description: "TCP/IP Protocol", location: "Room 302", completed: false },
        { id: 6, day: "friday", time: "03:00 PM", subject: "Software Engineering", description: "Agile Methodology", location: "Room 105", completed: false }
    ];
}

// Setup Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('globalSearch').addEventListener('input', handleSearch);
    
    // Delegated event listener for task checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.dataset.taskId);
            toggleTaskComplete(taskId);
        }
    });
    
    // Global modal close listener for Lenis scroll management
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            e.target.classList.remove('active');
            setTimeout(() => {
                document.body.style.overflow = 'auto';
                startLenisScroll();
            }, 300);
        }
    });
    
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('studyhub-theme');
        if (savedTheme === 'auto') {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            appData.theme = newTheme;
            
            const icon = document.querySelector('#themeToggle i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    });
}

// Toggle single task complete status
function toggleTaskComplete(taskId) {
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

// Switch View with smooth transitions
function switchView(viewName) {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

    // Get current and target views
    const currentView = document.querySelector('.view.active');
    const targetView = document.getElementById(viewName + 'View');
    
    if (!targetView || currentView === targetView) return;
    
    // Remove active class from current view
    if (currentView) {
        currentView.classList.remove('active');
    }
    
    // Small delay to ensure smooth transition
    requestAnimationFrame(() => {
        targetView.classList.add('active');
        appData.currentView = viewName;
        
        // Apply stagger animation to cards in the new view
        applyStaggerAnimation(targetView);
        
        // Scroll to top of new view with Lenis
        if (lenis) {
            lenis.scrollTo(0, { duration: 0.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function applyStaggerAnimation(container) {
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

// Toggle Theme
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply theme
    html.setAttribute('data-theme', newTheme);
    appData.theme = newTheme;
    
    // Save to localStorage
    localStorage.setItem('studyhub-theme', newTheme);
    
    // Update icon and aria-label
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    // Update settings dropdown
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = newTheme;
    }
    
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'success');
}

function changeTheme(theme) {
    let appliedTheme = theme;
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        appliedTheme = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', appliedTheme);
    appData.theme = appliedTheme;
    localStorage.setItem('studyhub-theme', theme);
    
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

function toggleSetting(setting) {
    if (appData.settings.hasOwnProperty(setting)) {
        appData.settings[setting] = !appData.settings[setting];
        
        // Update toggle UI
        updateSettingsUI();
        
        // Apply setting effects
        applySettingEffect(setting);
        
        // Save settings
        localStorage.setItem('aura-settings', JSON.stringify(appData.settings));
        
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

function applySettingEffect(setting) {
    switch (setting) {
        case 'compactMode':
            document.body.classList.toggle('compact-mode', appData.settings.compactMode);
            break;
        case 'showCompleted':
            renderTasks();
            break;
        case 'notifications':
            if (appData.settings.notifications) {
                initNotifications();
            }
            break;
    }
}

function updateSettingsUI() {
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

function initSettingsUI() {
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

// Clear All Data
function clearAllData() {
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

function updateDashboard() {
    updateGreeting();
    
    // Get current stats
    const stats = {
        totalNotes: appData.notes.length,
        activeTasks: appData.tasks.filter(t => t.status !== 'Done').length,
        codeSnippets: appData.snippets.length,
        savedResources: appData.resources.length
    };
    
    // Animate stat values with count-up effect
    animateStatValue('totalNotes', stats.totalNotes);
    animateStatValue('activeTasks', stats.activeTasks);
    animateStatValue('codeSnippets', stats.codeSnippets);
    animateStatValue('savedResources', stats.savedResources);
    
    // Update recent activity
    updateRecentActivity();
}

// Animate stat values with count-up effect
function animateStatValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        element.setAttribute('data-target', targetValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateValue);
}

function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.getElementById('greetingText');
    
    if (!greetingElement) return;
    
    let greeting;
    if (hour >= 5 && hour < 12) {
        greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
        greeting = 'Good evening';
    } else {
        greeting = 'Welcome back';
    }
    
    greetingElement.textContent = greeting;
}

function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    const activities = [
        { icon: 'fa-sticky-note', text: `Added ${appData.notes.length} notes`, time: 'Today', color: 'var(--color-primary)' },
        { icon: 'fa-tasks', text: `${appData.tasks.filter(t => t.status !== 'Done').length} tasks in progress`, time: 'Today', color: 'var(--color-success)' },
        { icon: 'fa-code', text: `${appData.snippets.length} code snippets saved`, time: 'This week', color: 'var(--color-warning)' },
        { icon: 'fa-book', text: `${appData.resources.length} resources bookmarked`, time: 'This week', color: 'var(--color-info)' }
    ];
    
    if (activities.every(a => a.text.match(/\d+/)[0] === '0')) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity. Start creating to see your progress!</p></div>';
        return;
    }
    
    container.innerHTML = activities.map((activity, index) => `
        <div class="activity-item" style="animation-delay: ${index * 0.1}s;">
            <div class="activity-icon" style="background: ${activity.color}15; color: ${activity.color};">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Refresh recent activity with animation
function refreshRecentActivity() {
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

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Update time
    updateCurrentTime();
}

function updateCurrentTime() {
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

function startLiveClock() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

// Display Random Quote
function displayRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (!quoteDisplay) return;
    
    // Fade out
    quoteDisplay.style.opacity = '0';
    quoteDisplay.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        quoteDisplay.innerHTML = `
            <div class="quote-content">
                <i class="fas fa-quote-left quote-icon-left"></i>
                <p class="quote-text">${quote.text}</p>
                <i class="fas fa-quote-right quote-icon-right"></i>
            </div>
            <p class="quote-author">— ${quote.author}</p>
        `;
        
        // Fade in
        quoteDisplay.style.opacity = '1';
        quoteDisplay.style.transform = 'translateY(0)';
    }, 300);
}

function renderAll() {
    renderNotes();
    renderTasks();
    renderSnippets();
    renderResources();
    renderSchedule();
    updateWeekOverview();
}

function renderNotes() {
    const container = document.getElementById('notesContainer');
    if (appData.notes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>No notes yet. Create your first one!</p></div>';
        return;
    }
    
    container.innerHTML = appData.notes.map(note => `
        <div class="card" style="cursor: pointer; animation: fadeIn 0.6s ease;">
            <h3 style="margin-bottom: var(--space-sm);">${note.title}</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-md);">${note.content.substring(0, 100)}...</p>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderTasks(tasksToRender = null) {
    const container = document.getElementById('tasksContainer');
    let tasks = tasksToRender || appData.tasks;
    
    // Filter based on showCompleted setting if no custom tasks provided
    if (!tasksToRender && !appData.settings.showCompleted) {
        tasks = tasks.filter(task => task.status !== 'Done');
    }
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No tasks found. Try adjusting your filters!</p></div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="card" style="animation: fadeIn 0.6s ease;">
            <div style="display: flex; align-items: flex-start; gap: var(--space-12); margin-bottom: var(--space-12);">
                <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.status === 'Done' ? 'checked' : ''}>
                <div style="flex: 1;">
                    <h3 style="margin-bottom: var(--space-8); ${task.status === 'Done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.title}</h3>
                    <p style="color: var(--color-text-secondary); margin-bottom: var(--space-12); font-size: var(--font-size-sm);">${task.description}</p>
                    <div style="display: flex; gap: var(--space-8); align-items: center; flex-wrap: wrap;">
                        <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);"><i class="fas fa-calendar"></i> ${task.dueDate}</span>
                        <span class="tag" style="font-size: var(--font-size-xs);">${task.status}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSnippets() {
    const container = document.getElementById('snippetsContainer');
    if (appData.snippets.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-code"></i><p>No code snippets yet. Add your first one!</p></div>';
        return;
    }
    
    container.innerHTML = appData.snippets.map(snippet => `
        <div class="card" style="animation: fadeIn 0.6s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <h3>${snippet.title}</h3>
                <span class="tag">${snippet.language}</span>
            </div>
            <pre style="background: var(--bg-secondary); padding: var(--space-md); border-radius: var(--radius); overflow-x: auto;"><code>${snippet.code}</code></pre>
        </div>
    `).join('');
}

function renderResources(resourcesToRender = null) {
    const container = document.getElementById('resourcesContainer');
    const resources = resourcesToRender || appData.resources;
    
    if (resources.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No resources found. Try adjusting your filters!</p></div>';
        updateResourceCount(0);
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => {
        const categoryIcon = getCategoryIcon(resource.category);
        const categoryColor = getCategoryColor(resource.category);
        
        return `
            <div class="card resource-card" style="animation: fadeIn 0.6s ease ${index * 0.05}s; animation-fill-mode: both; opacity: 0;" onclick="window.open('${resource.url}', '_blank')">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <div class="resource-category-icon" style="background: ${categoryColor}15; color: ${categoryColor};">
                            <i class="fas ${categoryIcon}"></i>
                        </div>
                        <span class="resource-category-badge" style="background: ${categoryColor}15; color: ${categoryColor};">${resource.category}</span>
                    </div>
                    <button class="btn-icon ripple" onclick="event.stopPropagation(); bookmarkResource(${resource.id})" title="Bookmark" style="opacity: 0.6;">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                
                <h3 style="margin-bottom: var(--space-sm); color: var(--color-text);">${resource.title}</h3>
                
                ${resource.description ? `<p style="color: var(--color-text-secondary); margin-bottom: var(--space-md); font-size: var(--font-size-sm); line-height: 1.5;">${resource.description}</p>` : ''}
                
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                    <i class="fas fa-external-link-alt"></i>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${resource.url}</span>
                </div>
                
                <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                    ${resource.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${resource.tags.length > 4 ? `<span class="tag">+${resource.tags.length - 4}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    updateResourceCount(resources.length);
}

function getCategoryIcon(category) {
    const icons = {
        'Documentation': 'fa-book',
        'Course': 'fa-graduation-cap',
        'Practice': 'fa-code',
        'Video': 'fa-video',
        'Tool': 'fa-tools',
        'Community': 'fa-users',
        'Design': 'fa-palette',
        'Blog': 'fa-rss',
        'Reference': 'fa-file-alt',
        'Resource': 'fa-folder',
        'News': 'fa-newspaper',
        'Newsletter': 'fa-envelope'
    };
    return icons[category] || 'fa-link';
}

function getCategoryColor(category) {
    const colors = {
        'Documentation': '#3b82f6',
        'Course': '#10b981',
        'Practice': '#8b5cf6',
        'Video': '#ef4444',
        'Tool': '#f59e0b',
        'Community': '#ec4899',
        'Design': '#06b6d4',
        'Blog': '#6366f1',
        'Reference': '#14b8a6',
        'Resource': '#84cc16',
        'News': '#f97316',
        'Newsletter': '#a855f7'
    };
    return colors[category] || 'var(--color-primary)';
}

function updateResourceCount(count) {
    const countElement = document.getElementById('resourceCount');
    if (countElement) {
        countElement.textContent = `Showing ${count} resource${count !== 1 ? 's' : ''} of ${appData.resources.length} total`;
    }
}

function filterResources() {
    const searchTerm = document.getElementById('resourceSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('resourceCategoryFilter')?.value || 'all';
    
    let filtered = appData.resources;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(r => r.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(r => {
            return r.title.toLowerCase().includes(searchTerm) ||
                   r.url.toLowerCase().includes(searchTerm) ||
                   r.category.toLowerCase().includes(searchTerm) ||
                   (r.description && r.description.toLowerCase().includes(searchTerm)) ||
                   r.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        });
    }
    
    renderResources(filtered);
}

function resetResourceFilters() {
    const searchInput = document.getElementById('resourceSearch');
    const categorySelect = document.getElementById('resourceCategoryFilter');
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    
    renderResources();
    showToast('Filters reset', 'success');
}

function bookmarkResource(id) {
    showToast('Resource bookmarked!', 'success');
}

// timers
// Pomodoro Timer Optimization
const pomodoroState = {
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

function setPomodoroMode(mode) {
    if (pomodoroState.isActive) {
        const confirmSwitch = confirm('Timer is running. Switch mode?');
        if (!confirmSwitch) return;
        pausePomodoro();
    }

    pomodoroState.mode = mode;
    pomodoroState.timeLeft = pomodoroState.modes[mode];
    pomodoroState.totalTime = pomodoroState.modes[mode];
    
    // Update UI buttons
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

function startPomodoro() {
    if (pomodoroState.isActive) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    pomodoroState.isActive = true;
    pomodoroState.endTime = Date.now() + (pomodoroState.timeLeft * 1000);
    
    pomodoroState.interval = setInterval(() => {
        const now = Date.now();
        const diff = pomodoroState.endTime - now;
        
        if (diff <= 0) {
            completePomodoro();
        } else {
            pomodoroState.timeLeft = Math.ceil(diff / 1000);
            updatePomodoroDisplay();
        }
    }, 100);
    
    showToast(`Pomodoro ${pomodoroState.mode.replace(/([A-Z])/g, ' $1').toLowerCase()} started!`, 'success');
}

function pausePomodoro() {
    if (!pomodoroState.isActive) return;
    
    clearInterval(pomodoroState.interval);
    pomodoroState.isActive = false;
    pomodoroState.interval = null;
    showToast('Timer paused', 'info');
}

function resetPomodoro() {
    pausePomodoro();
    pomodoroState.timeLeft = pomodoroState.modes[pomodoroState.mode];
    updatePomodoroDisplay();
    showToast('Timer reset', 'info');
}

function completePomodoro() {
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

function updatePomodoroDisplay() {
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

function playNotificationSound() {
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

let stopwatchInterval = null;
let stopwatchSeconds = 0;

function startStopwatch() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        stopwatchSeconds++;
        updateStopwatchDisplay();
    }, 1000);
}

function pauseStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}

function resetStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
}

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;
    document.getElementById('stopwatchDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

let countdownInterval = null;
let countdownSeconds = 0;

function startCountdown() {
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

function resetCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    countdownSeconds = 0;
    updateCountdownDisplay();
}

function updateCountdownDisplay() {
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;
    document.getElementById('countdownDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const clockDisplay = document.getElementById('clockDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (clockDisplay) clockDisplay.textContent = timeString;
    if (dateDisplay) dateDisplay.textContent = dateString;
}

setInterval(updateClock, 1000);
updateClock();

// focus session
let focusInterval = null;
let focusSecondsRemaining = 0;
let focusSessionMinutes = 0;
let focusStartTime = null;
let focusPaused = false;

function loadFocusData() {
    const saved = localStorage.getItem('aura-focus-data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appData.focusMode = { ...appData.focusMode, ...data };
            
            // Check if last session was today
            const today = new Date().toDateString();
            if (appData.focusMode.lastSessionDate !== today) {
                appData.focusMode.minutesToday = 0;
            }
            
            // Calculate weekly hours
            calculateWeeklyHours();
            updateFocusStats();
        } catch (e) {
            console.error('Error loading focus data:', e);
        }
    }
}

function saveFocusData() {
    localStorage.setItem('aura-focus-data', JSON.stringify(appData.focusMode));
}

// Calculate Weekly Hours
function calculateWeeklyHours() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekSessions = appData.focusMode.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= oneWeekAgo;
    });
    
    const totalMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    appData.focusMode.weeklyHours = (totalMinutes / 60).toFixed(1);
}

// Update Focus Stats Display
function updateFocusStats() {
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

// Start Focus Session
function startFocusSession(minutes) {
    // Check if session already running
    if (focusInterval) {
        showToast('A focus session is already running!', 'error');
        return;
    }
    
    focusSessionMinutes = minutes;
    focusSecondsRemaining = minutes * 60;
    focusStartTime = new Date();
    focusPaused = false;
    
    // Show focus modal
    showFocusModal();
    
    // Start timer
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

// Update Focus Display
function updateFocusDisplay() {
    const display = document.getElementById('focusTimerDisplay');
    if (!display) return;
    
    const minutes = Math.floor(focusSecondsRemaining / 60);
    const seconds = focusSecondsRemaining % 60;
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const totalSeconds = focusSessionMinutes * 60;
    const progress = ((totalSeconds - focusSecondsRemaining) / totalSeconds) * 100;
    const progressBar = document.getElementById('focusProgressBar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// Pause Focus Session
function pauseFocusSession() {
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

// Stop Focus Session
function stopFocusSession() {
    if (!focusInterval) return;
    
    if (confirm('Are you sure you want to end this focus session early?')) {
        const minutesCompleted = Math.floor((focusSessionMinutes * 60 - focusSecondsRemaining) / 60);
        
        if (minutesCompleted > 0) {
            recordPartialSession(minutesCompleted);
        }
        
        clearInterval(focusInterval);
        focusInterval = null;
        closeFocusModal();
        showToast(`Session ended. ${minutesCompleted} minutes completed.`, 'info');
    }
}

// Complete Focus Session
function completeFocusSession() {
    clearInterval(focusInterval);
    focusInterval = null;
    
    // Update stats
    const today = new Date().toDateString();
    appData.focusMode.minutesToday += focusSessionMinutes;
    appData.focusMode.totalSessions++;
    
    // Update streak
    if (appData.focusMode.lastSessionDate === today) {
        // Same day, don't change streak
    } else if (isConsecutiveDay(appData.focusMode.lastSessionDate)) {
        appData.focusMode.streak++;
    } else {
        appData.focusMode.streak = 1;
    }
    
    appData.focusMode.lastSessionDate = today;
    
    // Record session
    appData.focusMode.sessions.push({
        date: new Date().toISOString(),
        duration: focusSessionMinutes,
        completed: true
    });
    
    // Keep only last 30 days of sessions
    if (appData.focusMode.sessions.length > 100) {
        appData.focusMode.sessions = appData.focusMode.sessions.slice(-100);
    }
    
    calculateWeeklyHours();
    saveFocusData();
    updateFocusStats();
    
    // Show completion message
    showFocusCompletionModal();
    closeFocusModal();
}

// Record Partial Session
function recordPartialSession(minutes) {
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

// Check Consecutive Day
function isConsecutiveDay(lastDateString) {
    if (!lastDateString) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return lastDateString === yesterday.toDateString();
}

// Show Focus Modal
function showFocusModal() {
    const modal = document.getElementById('focusSessionModal');
    if (modal) {
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            stopLenisScroll();
            updateFocusDisplay();
        });
    }
}

// Close Focus Modal
function closeFocusModal() {
    const modal = document.getElementById('focusSessionModal');
    if (modal) {
        modal.classList.remove('active');
        // Delay overflow reset to allow fade-out animation
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            startLenisScroll();
        }, 300);
    }
}

// Show Focus Completion Modal
function showFocusCompletionModal() {
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
    
    // Trigger transition after append
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
    
    // Play success sound (optional - requires audio file)
    playSuccessSound();
    
    // Confetti effect
    triggerConfetti();
}

// Play Success Sound
function playSuccessSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKjo77pjHwU7k9nzxnkqBSh+zPLaizsKG2S56+mmVRIJSKHh8bllHgU1ic/y1Ic1Bxptv/DinUwND1Cq6O+7Yh4FOpPY88p2KwUrfsvx3Is1CRxguur0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo7r1hHwU7ktjzyXcrBSt/zPHaizYJHGG66PSlXRQKSKPh8blkHAUzic7x2Ig5Bxxmve/gnUwMDlCr6O69YR8FO5LY88l3KwUrf8zx2os2CRxhuuj0pV0UCkij4fG5ZBwFM4nO8diIOQccZr3v4J1MDA5Qq+juvWEfBTuS2PPJdysFK3/M8dqLNgkcYbro9KVdFApIo+HxuWQcBTOJzvHYiDkHHGa97+CdTAwOUKvo');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Trigger Confetti Effect
function triggerConfetti() {
    // Simple confetti effect using CSS animations
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

function showToast(message, type = 'success') {
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

function renderSchedule(filterDay = 'all') {
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
    
    container.innerHTML = Object.keys(groupedSchedule).map(day => `
        <div style="margin-bottom: var(--space-xl);">
            <h4 style="text-transform: capitalize; margin-bottom: var(--space-md); color: var(--accent);">
                <i class="fas fa-calendar-day"></i> ${day}
            </h4>
            ${groupedSchedule[day].map(item => `
                <div class="schedule-item ${item.completed ? 'completed' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div class="schedule-time"><i class="fas fa-clock"></i> ${item.time}</div>
                            <div class="schedule-subject">${item.subject}</div>
                            <div class="schedule-description">${item.description}</div>
                            <div style="display: flex; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
                                <span style="font-size: 12px; color: var(--text-secondary);">
                                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                                </span>
                                <span class="schedule-day-badge">${item.day}</span>
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
            `).join('')}
        </div>
    `).join('');
}

// Update Week Overview
function updateWeekOverview() {
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
            
            // Add visual indicator if no items
            dayCountElement.style.opacity = count === 0 ? '0.5' : '1';
        }
        
        // Update completed count
        const completedElement = document.querySelector(`.day-card[data-day="${day}"] .day-completed`);
        if (completedElement) {
            completedElement.textContent = `✓ ${completedCount}`;
            completedElement.style.display = count > 0 ? 'inline-flex' : 'none';
        }
        
        // Update aria-label for accessibility
        const dayCard = document.querySelector(`.day-card[data-day="${day}"]`);
        if (dayCard) {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            dayCard.setAttribute('aria-label', `${dayName}: ${count} item${count !== 1 ? 's' : ''}, ${completedCount} completed`);
            
            // Add visual indicator for busy days
            if (count >= 5) {
                dayCard.classList.add('busy-day');
            } else {
                dayCard.classList.remove('busy-day');
            }
        }
    });
    
    // Update total count
    const weekTotalElement = document.getElementById('weekTotal');
    if (weekTotalElement) {
        weekTotalElement.textContent = totalItems;
    }
}

// Filter Schedule
function filterSchedule(day) {
    try {
        // Remove active class from all day cards
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to selected day
        if (day && day !== 'all') {
            const selectedCard = document.querySelector(`.day-card[data-day="${day}"]`);
            if (selectedCard) {
                selectedCard.classList.add('active');
                selectedCard.setAttribute('aria-pressed', 'true');
                
                // Announce filter change
                const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                showToast(`Viewing ${dayName}'s schedule`, 'success');
            }
        } else {
            showToast('Viewing all days', 'success');
        }
        
        // Render filtered schedule
        renderSchedule(day);
    } catch (error) {
        console.error('Error filtering schedule:', error);
        showToast('Error filtering schedule. Please try again.', 'error');
    }
}

// Toggle Schedule Complete
function toggleScheduleComplete(id) {
    try {
        const item = appData.schedule.find(s => s.id === id);
        if (item) {
            item.completed = !item.completed;
            
            // Update displays
            const filterValue = document.getElementById('scheduleFilter')?.value || 'all';
            renderSchedule(filterValue);
            updateWeekOverview();
            
            // Show feedback
            showToast(
                item.completed 
                    ? `✓ ${item.subject} completed!` 
                    : `${item.subject} marked as incomplete`,
                'success'
            );
        } else {
            throw new Error('Schedule item not found');
        }
    } catch (error) {
        console.error('Error toggling schedule item:', error);
        showToast('Error updating schedule item. Please try again.', 'error');
    }
}

// Delete Schedule Item
function deleteScheduleItem(id) {
    if (confirm('Are you sure you want to delete this schedule item?')) {
        appData.schedule = appData.schedule.filter(s => s.id !== id);
        renderSchedule(document.getElementById('scheduleFilter').value);
        updateWeekOverview();
        showToast('Schedule item deleted', 'success');
    }
}

// Add Day Card Click Listeners
function setupDayCardListeners() {
    document.querySelectorAll('.day-card').forEach(card => {
        // Click event
        card.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const scheduleFilter = document.getElementById('scheduleFilter');
            if (scheduleFilter) {
                scheduleFilter.value = day;
            }
            filterSchedule(day);
            
            // Scroll to schedule section
            const scheduleContainer = document.getElementById('scheduleContainer');
            if (scheduleContainer) {
                scheduleContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        
        // Keyboard navigation (Enter and Space)
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Arrow key navigation
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

// Placeholder functions
function showNoteEditor() { showToast('Note editor opening...', 'success'); }
function showTaskEditor() { showToast('Task editor opening...', 'success'); }
function showSnippetEditor() { showToast('Snippet editor opening...', 'success'); }
function showScheduleEditor() { 
    showToast('Schedule editor opening...', 'success');
    // In a full implementation, this would open a modal with a form
}
function showResourceEditor() { showToast('Resource editor opening...', 'success'); }

// Start Custom Focus Session
function startCustomFocusSession() {
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

// View Focus History
function viewFocusHistory() {
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
                                                    ${session.completed ? 
                                                        '<i class="fas fa-check-circle" style="color: var(--color-success); margin-left: var(--space-4);"></i>' : 
                                                        '<i class="fas fa-clock" style="color: var(--color-warning); margin-left: var(--space-4);"></i>'}
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
    
    // Trigger transition after append
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

// Update total sessions display
function updateTotalSessions() {
    const element = document.getElementById('totalSessions');
    if (element) {
        element.textContent = appData.focusMode.totalSessions;
    }
}

// Network Animation Background
function initNetworkAnimation() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79, 70, 229, 0.6)';
            ctx.fill();
        }
    }
    
    // Create particles
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // Draw connections
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(79, 70, 229, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// User Profile Functions
function openUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (!modal) return;
    
    // Load saved profile data
    loadUserProfile();
    
    // Show modal with smooth transition
    requestAnimationFrame(() => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('userName')?.focus();
    }, 100);
}

function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 300);
}

function loadUserProfile() {
    // Load from localStorage if available
    const savedProfile = localStorage.getItem('aura-user-profile');
    if (savedProfile) {
        try {
            appData.userProfile = JSON.parse(savedProfile);
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }
    
    // Populate form fields
    document.getElementById('userName').value = appData.userProfile.name || '';
    document.getElementById('userEmail').value = appData.userProfile.email || '';
    document.getElementById('userBio').value = appData.userProfile.bio || '';
    document.getElementById('userGoal').value = appData.userProfile.goal || '';
    document.getElementById('userSkills').value = appData.userProfile.skills.join(', ') || '';
    
    // Update avatar icon
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (avatarIcon) {
        avatarIcon.className = `fas ${appData.userProfile.avatarIcon}`;
    }
}

function saveUserProfile(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const bio = document.getElementById('userBio').value.trim();
    const goal = document.getElementById('userGoal').value.trim();
    const skillsInput = document.getElementById('userSkills').value.trim();
    const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Validate required fields
    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }
    
    if (!email) {
        showToast('Please enter your email', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Update profile
    appData.userProfile = {
        ...appData.userProfile,
        name,
        email,
        bio,
        goal,
        skills
    };
    
    // Save to localStorage
    localStorage.setItem('aura-user-profile', JSON.stringify(appData.userProfile));
    
    // Update UI
    updateUserGreeting();
    
    // Close modal
    closeUserProfile();
    
    // Show success message
    showToast('Profile updated successfully!', 'success');
}

function updateUserGreeting() {
    if (appData.userProfile.name) {
        const greetingElement = document.getElementById('greetingText');
        if (greetingElement) {
            const hour = new Date().getHours();
            let greeting;
            if (hour >= 5 && hour < 12) {
                greeting = 'Good morning';
            } else if (hour >= 12 && hour < 17) {
                greeting = 'Good afternoon';
            } else if (hour >= 17 && hour < 22) {
                greeting = 'Good evening';
            } else {
                greeting = 'Welcome back';
            }
            greetingElement.textContent = `${greeting}, ${appData.userProfile.name.split(' ')[0]}`;
        }
    }
}

function changeAvatar() {
    const avatarIcons = [
        'fa-user',
        'fa-user-circle',
        'fa-user-astronaut',
        'fa-user-ninja',
        'fa-user-graduate',
        'fa-user-tie',
        'fa-smile',
        'fa-grin',
        'fa-laugh',
        'fa-grin-stars'
    ];
    
    // Show selection options
    const currentIndex = avatarIcons.indexOf(appData.userProfile.avatarIcon);
    const nextIndex = (currentIndex + 1) % avatarIcons.length;
    appData.userProfile.avatarIcon = avatarIcons[nextIndex];
    
    // Update display
    const avatarIcon = document.getElementById('profileAvatarIcon');
    if (avatarIcon) {
        avatarIcon.className = `fas ${appData.userProfile.avatarIcon}`;
    }
    
    // Update header avatar
    const headerAvatar = document.querySelector('#userAvatar i');
    if (headerAvatar) {
        headerAvatar.className = `fas ${appData.userProfile.avatarIcon}`;
    }
    
    showToast('Avatar updated!', 'success');
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('userProfileModal');
    if (event.target === modal) {
        closeUserProfile();
    }
});

// Close modal with Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('userProfileModal');
        if (modal && modal.classList.contains('active')) {
            closeUserProfile();
        }
    }
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupDayCardListeners();
    
    // Load user profile and update greeting
    const savedProfile = localStorage.getItem('aura-user-profile');
    if (savedProfile) {
        try {
            appData.userProfile = JSON.parse(savedProfile);
            updateUserGreeting();
            // Update header avatar icon
            const headerAvatar = document.querySelector('#userAvatar i');
            if (headerAvatar && appData.userProfile.avatarIcon) {
                headerAvatar.className = `fas ${appData.userProfile.avatarIcon}`;
            }
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }
    
    // Load focus mode data
    loadFocusData();
    updateTotalSessions();
    
    // Initialize new features
    initKeyboardShortcuts();
    initAutoSave();
    loadAllData();
    initNotifications();
    updateProductivityStats();
    initTechNews();
    initTechEvents();
});

// keyboard shortcuts
function initKeyboardShortcuts() {
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
        
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key]();
        }
    });
}

function showShortcutsModal() {
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
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>N</kbd>
                        <span>New Note</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>T</kbd>
                        <span>New Task</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>Focus Search</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>S</kbd>
                        <span>Save All</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>B</kbd>
                        <span>Export Backup</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd>
                        <span>Show Shortcuts</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>1-5</kbd>
                        <span>Quick Navigation</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>F</kbd>
                        <span>Focus Mode</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close Modal</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

function initAutoSave() {
    if (appData.settings.autoSave) {
        setInterval(() => {
            saveAllData();
            showNotification('Auto-saved', 'success', 2000);
        }, 120000); // Every 2 minutes
    }
}

function saveAllData() {
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

function loadAllData() {
    try {
        const notes = localStorage.getItem('aura-notes');
        const tasks = localStorage.getItem('aura-tasks');
        const snippets = localStorage.getItem('aura-snippets');
        const schedule = localStorage.getItem('aura-schedule');
        const settings = localStorage.getItem('aura-settings');
        const productivity = localStorage.getItem('aura-productivity');
        
        if (notes) appData.notes = JSON.parse(notes);
        if (tasks) appData.tasks = JSON.parse(tasks);
        if (snippets) appData.snippets = JSON.parse(snippets);
        if (schedule) appData.schedule = JSON.parse(schedule);
        if (settings) appData.settings = { ...appData.settings, ...JSON.parse(settings) };
        if (productivity) appData.productivity = { ...appData.productivity, ...JSON.parse(productivity) };
        
        renderAll();
        updateDashboard();
    } catch (e) {
        console.error('Load error:', e);
    }
}

function exportAllData() {
    const exportData = {
        version: '1.0',
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

function importData() {
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
                
                if (confirm('⚠️ This will replace all current data. Continue?')) {
                    if (importedData.data) {
                        appData.notes = importedData.data.notes || [];
                        appData.tasks = importedData.data.tasks || [];
                        appData.snippets = importedData.data.snippets || [];
                        appData.schedule = importedData.data.schedule || [];
                        appData.userProfile = importedData.data.userProfile || appData.userProfile;
                        appData.focusMode = importedData.data.focusMode || appData.focusMode;
                        appData.productivity = importedData.data.productivity || appData.productivity;
                        appData.settings = importedData.data.settings || appData.settings;
                        
                        saveAllData();
                        renderAll();
                        updateDashboard();
                        showNotification('✅ Data imported successfully!', 'success', 3000);
                    }
                }
            } catch (error) {
                showNotification('❌ Invalid file format', 'error', 3000);
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// search
let searchTimeout = null;
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query.length > 0) {
            addToSearchHistory(query);
            performGlobalSearch(query);
        }
    }, 300);
}

function addToSearchHistory(query) {
    if (!appData.searchHistory.includes(query)) {
        appData.searchHistory.unshift(query);
        if (appData.searchHistory.length > 10) {
            appData.searchHistory = appData.searchHistory.slice(0, 10);
        }
        localStorage.setItem('aura-search-history', JSON.stringify(appData.searchHistory));
    }
}

function performGlobalSearch(query) {
    const results = {
        notes: appData.notes.filter(n => 
            n.title.toLowerCase().includes(query) || 
            n.content.toLowerCase().includes(query) ||
            n.tags.some(t => t.toLowerCase().includes(query))
        ),
        tasks: appData.tasks.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.description.toLowerCase().includes(query)
        ),
        snippets: appData.snippets.filter(s => 
            s.title.toLowerCase().includes(query) || 
            s.code.toLowerCase().includes(query)
        ),
        resources: appData.resources.filter(r => 
            r.title.toLowerCase().includes(query) || 
            r.description.toLowerCase().includes(query) ||
            r.tags.some(t => t.toLowerCase().includes(query))
        )
    };
    
    showSearchResults(results, query);
}

function showSearchResults(results, query) {
    const totalResults = results.notes.length + results.tasks.length + 
                        results.snippets.length + results.resources.length;
    
    if (totalResults === 0) {
        showNotification(`No results found for "${query}"`, 'info', 2000);
        return;
    }
    
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
                <p style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">
                    Found ${totalResults} result${totalResults !== 1 ? 's' : ''}
                </p>
                
                ${results.notes.length > 0 ? `
                    <div style="margin-bottom: var(--space-24);">
                        <h3 style="margin-bottom: var(--space-12);">📝 Notes (${results.notes.length})</h3>
                        <div style="display: grid; gap: var(--space-12);">
                            ${results.notes.map(note => `
                                <div class="card" style="padding: var(--space-12); cursor: pointer;" onclick="switchView('notes'); this.closest('.modal').remove();">
                                    <h4>${note.title}</h4>
                                    <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-4);">
                                        ${note.content.substring(0, 100)}...
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${results.tasks.length > 0 ? `
                    <div style="margin-bottom: var(--space-24);">
                        <h3 style="margin-bottom: var(--space-12);">✅ Tasks (${results.tasks.length})</h3>
                        <div style="display: grid; gap: var(--space-12);">
                            ${results.tasks.map(task => `
                                <div class="card" style="padding: var(--space-12); cursor: pointer;" onclick="switchView('tasks'); this.closest('.modal').remove();">
                                    <h4>${task.title}</h4>
                                    <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-4);">
                                        ${task.description}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${results.snippets.length > 0 ? `
                    <div style="margin-bottom: var(--space-24);">
                        <h3 style="margin-bottom: var(--space-12);">💻 Snippets (${results.snippets.length})</h3>
                        <div style="display: grid; gap: var(--space-12);">
                            ${results.snippets.map(snippet => `
                                <div class="card" style="padding: var(--space-12); cursor: pointer;" onclick="switchView('snippets'); this.closest('.modal').remove();">
                                    <h4>${snippet.title}</h4>
                                    <span class="tag" style="margin-top: var(--space-4);">${snippet.language}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${results.resources.length > 0 ? `
                    <div style="margin-bottom: var(--space-24);">
                        <h3 style="margin-bottom: var(--space-12);">📚 Resources (${results.resources.length})</h3>
                        <div style="display: grid; gap: var(--space-12);">
                            ${results.resources.map(resource => `
                                <div class="card" style="padding: var(--space-12); cursor: pointer;" onclick="window.open('${resource.url}', '_blank'); this.closest('.modal').remove();">
                                    <h4>${resource.title}</h4>
                                    <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-4);">
                                        ${resource.description}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

function updateProductivityStats() {
    const today = new Date().toDateString();
    const completedTasks = appData.tasks.filter(t => t.status === 'Done').length;
    const totalTasks = appData.tasks.length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;
    
    appData.productivity.completedToday = completedTasks;
    appData.productivity.completionRate = completionRate;
    
    // Track daily progress
    const existingEntry = appData.productivity.history.find(h => h.date === today);
    if (existingEntry) {
        existingEntry.completed = completedTasks;
        existingEntry.total = totalTasks;
    } else {
        appData.productivity.history.push({
            date: today,
            completed: completedTasks,
            total: totalTasks,
            focusMinutes: appData.focusMode.minutesToday
        });
        
        // Keep only last 30 days
        if (appData.productivity.history.length > 30) {
            appData.productivity.history = appData.productivity.history.slice(-30);
        }
    }
    
    localStorage.setItem('aura-productivity', JSON.stringify(appData.productivity));
}

function showProductivityReport() {
    const last7Days = appData.productivity.history.slice(-7);
    const avgCompletion = last7Days.length > 0 
        ? (last7Days.reduce((sum, day) => sum + (day.completed / Math.max(day.total, 1)), 0) / last7Days.length * 100).toFixed(0)
        : 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Productivity Report</h2>
                <button class="modal-close" onclick="const m = this.closest('.modal'); m.classList.remove('active'); setTimeout(() => { m.remove(); document.body.style.overflow = 'auto'; }, 300);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="stats-grid" style="margin-bottom: var(--space-24);">
                    <div class="stat-card card">
                        <div class="stat-value">${appData.tasks.filter(t => t.status === 'Done').length}</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-value">${avgCompletion}%</div>
                        <div class="stat-label">7-Day Average</div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-value">${appData.focusMode.totalSessions}</div>
                        <div class="stat-label">Focus Sessions</div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-value">${appData.focusMode.streak}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>
                
                <h3 style="margin-bottom: var(--space-12);">Last 7 Days</h3>
                <div style="display: grid; gap: var(--space-8);">
                    ${last7Days.map(day => `
                        <div style="display: flex; justify-content: space-between; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-base);">
                            <span>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>${day.completed} / ${day.total} tasks</span>
                            <span>${day.focusMinutes} min focus</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
}

function initNotifications() {
    if ('Notification' in window && appData.settings.notifications) {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// task filters
function filterTasks(filter) {
    let filtered = [...appData.tasks];
    
    switch(filter) {
        case 'active':
            filtered = filtered.filter(t => t.status !== 'Done');
            break;
        case 'completed':
            filtered = filtered.filter(t => t.status === 'Done');
            break;
        case 'high':
            filtered = filtered.filter(t => t.priority === 'High');
            break;
        case 'today':
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(t => t.dueDate === today);
            break;
    }
    
    renderTasks(filtered);
}

function sortTasks(sortBy) {
    let sorted = [...appData.tasks];
    
    switch(sortBy) {
        case 'priority':
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'dueDate':
            sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'status':
            sorted.sort((a, b) => a.status.localeCompare(b.status));
            break;
    }
    
    renderTasks(sorted);
}

function selectAllTasks() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
}

function deleteSelectedTasks() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('No tasks selected', 'info', 2000);
        return;
    }
    
    if (confirm(`Delete ${checkboxes.length} selected task(s)?`)) {
        checkboxes.forEach(cb => {
            const taskId = parseInt(cb.dataset.taskId);
            const index = appData.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                appData.tasks.splice(index, 1);
            }
        });
        saveAllData();
        renderTasks();
        updateDashboard();
        showNotification(`${checkboxes.length} task(s) deleted`, 'success', 2000);
    }
}

function markSelectedTasksComplete() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('No tasks selected', 'info', 2000);
        return;
    }
    
    checkboxes.forEach(cb => {
        const taskId = parseInt(cb.dataset.taskId);
        const task = appData.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'Done';
        }
    });
    
    saveAllData();
    renderTasks();
    updateDashboard();
    updateProductivityStats();
    showNotification(`${checkboxes.length} task(s) marked complete`, 'success', 2000);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 300);
    });
}

function initTechNews() {
    // Sample tech news data
    appData.techNews = [
        {
            id: 1,
            title: "AI Breakthrough: New Language Model Surpasses GPT-4",
            source: "TechCrunch",
            date: "2025-11-24",
            category: "AI/ML",
            url: "https://techcrunch.com",
            image: "https://via.placeholder.com/400x250/32808d/ffffff?text=AI+News",
            summary: "Researchers announce a groundbreaking AI model with enhanced reasoning capabilities and reduced hallucinations.",
            tags: ["AI", "Machine Learning", "GPT"]
        },
        {
            id: 2,
            title: "JavaScript Framework Wars: The Rise of New Contenders",
            source: "Dev.to",
            date: "2025-11-23",
            category: "Web Dev",
            url: "https://dev.to",
            image: "https://via.placeholder.com/400x250/21808d/ffffff?text=JavaScript",
            summary: "New lightweight frameworks are challenging React and Vue's dominance in the frontend ecosystem.",
            tags: ["JavaScript", "Frameworks", "Web Development"]
        },
        {
            id: 3,
            title: "Quantum Computing Achieves Major Milestone",
            source: "MIT Technology Review",
            date: "2025-11-22",
            category: "Computing",
            url: "https://technologyreview.com",
            image: "https://via.placeholder.com/400x250/1d6c78/ffffff?text=Quantum",
            summary: "Scientists demonstrate practical quantum advantage in solving real-world optimization problems.",
            tags: ["Quantum", "Computing", "Science"]
        },
        {
            id: 4,
            title: "Cybersecurity Alert: New Zero-Day Vulnerability Discovered",
            source: "The Hacker News",
            date: "2025-11-21",
            category: "Security",
            url: "https://thehackernews.com",
            image: "https://via.placeholder.com/400x250/195c66/ffffff?text=Security",
            summary: "Critical vulnerability affects millions of devices. Patches are being rolled out urgently.",
            tags: ["Security", "Vulnerability", "Cybersecurity"]
        },
        {
            id: 5,
            title: "Web3 Revolution: Decentralized Apps Go Mainstream",
            source: "CoinDesk",
            date: "2025-11-20",
            category: "Blockchain",
            url: "https://coindesk.com",
            image: "https://via.placeholder.com/400x250/154c54/ffffff?text=Web3",
            summary: "Major companies are integrating blockchain technology into their platforms, signaling Web3 adoption.",
            tags: ["Web3", "Blockchain", "DApps"]
        },
        {
            id: 6,
            title: "5G Networks Enable Revolutionary IoT Applications",
            source: "Wired",
            date: "2025-11-19",
            category: "IoT",
            url: "https://wired.com",
            image: "https://via.placeholder.com/400x250/0f3c42/ffffff?text=5G+IoT",
            summary: "Next-generation connectivity is powering smart cities and connected devices at unprecedented scale.",
            tags: ["5G", "IoT", "Connectivity"]
        },
        {
            id: 7,
            title: "Open Source AI Models Challenge Proprietary Giants",
            source: "GitHub Blog",
            date: "2025-11-18",
            category: "Open Source",
            url: "https://github.blog",
            image: "https://via.placeholder.com/400x250/32808d/ffffff?text=Open+Source",
            summary: "Community-driven AI projects are democratizing access to powerful machine learning models.",
            tags: ["Open Source", "AI", "Community"]
        },
        {
            id: 8,
            title: "Cloud Computing: Edge Computing Takes Center Stage",
            source: "AWS News",
            date: "2025-11-17",
            category: "Cloud",
            url: "https://aws.amazon.com/blogs",
            image: "https://via.placeholder.com/400x250/21808d/ffffff?text=Cloud",
            summary: "Edge computing solutions are reducing latency and improving performance for distributed applications.",
            tags: ["Cloud", "Edge Computing", "Infrastructure"]
        }
    ];
    
    renderTechNews();
}

function renderTechNews() {
    const container = document.getElementById('newsContainer');
    
    if (!container) return;
    
    if (appData.techNews.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No tech news available. Check back later!</p></div>';
        return;
    }
    
    container.innerHTML = appData.techNews.map(news => `
        <div class="card news-card" style="animation: fadeIn 0.6s ease; overflow: hidden;">
            <div class="news-image" style="width: 100%; height: 180px; background: url('${news.image}') center/cover; border-radius: var(--radius-base); margin-bottom: var(--space-16);"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
                <span class="tag" style="font-size: var(--font-size-xs);">${news.category}</span>
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                    <i class="fas fa-clock"></i> ${formatNewsDate(news.date)}
                </span>
            </div>
            <h3 style="margin-bottom: var(--space-12); line-height: 1.4;">${news.title}</h3>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-12); line-height: 1.6;">
                ${news.summary}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-12);">
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                    <i class="fas fa-newspaper"></i> ${news.source}
                </span>
            </div>
            <div style="display: flex; gap: var(--space-6); flex-wrap: wrap; margin-bottom: var(--space-12);">
                ${news.tags.map(tag => `<span class="tag" style="font-size: var(--font-size-xs); padding: var(--space-2) var(--space-8);">#${tag}</span>`).join('')}
            </div>
            <div style="display: flex; gap: var(--space-8);">
                <button class="btn btn--primary btn--sm ripple" onclick="window.open('${news.url}', '_blank')" style="flex: 1;">
                    <i class="fas fa-external-link-alt"></i> Read More
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="shareNews(${news.id})" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="bookmarkNews(${news.id})" title="Bookmark">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function formatNewsDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function shareNews(newsId) {
    const news = appData.techNews.find(n => n.id === newsId);
    if (!news) return;
    
    if (navigator.share) {
        navigator.share({
            title: news.title,
            text: news.summary,
            url: news.url
        }).then(() => {
            showNotification('Shared successfully!', 'success', 2000);
        }).catch(() => {
            copyToClipboard(news.url);
        });
    } else {
        copyToClipboard(news.url);
    }
}

function bookmarkNews(newsId) {
    const news = appData.techNews.find(n => n.id === newsId);
    if (!news) return;
    
    if (!appData.bookmarks.find(b => b.type === 'news' && b.id === newsId)) {
        appData.bookmarks.push({ type: 'news', id: newsId, title: news.title, date: new Date().toISOString() });
        localStorage.setItem('aura-bookmarks', JSON.stringify(appData.bookmarks));
        showNotification('Bookmarked!', 'success', 2000);
    } else {
        showNotification('Already bookmarked', 'info', 2000);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Link copied to clipboard!', 'success', 2000);
    }).catch(() => {
        showNotification('Failed to copy link', 'error', 2000);
    });
}

function filterNewsByCategory(category) {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    const filtered = category === 'all' 
        ? appData.techNews 
        : appData.techNews.filter(n => n.category === category);
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No news found in this category.</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(news => `
        <div class="card news-card" style="animation: fadeIn 0.6s ease; overflow: hidden;">
            <div class="news-image" style="width: 100%; height: 180px; background: url('${news.image}') center/cover; border-radius: var(--radius-base); margin-bottom: var(--space-16);"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
                <span class="tag" style="font-size: var(--font-size-xs);">${news.category}</span>
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                    <i class="fas fa-clock"></i> ${formatNewsDate(news.date)}
                </span>
            </div>
            <h3 style="margin-bottom: var(--space-12); line-height: 1.4;">${news.title}</h3>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-12); line-height: 1.6;">
                ${news.summary}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-12);">
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                    <i class="fas fa-newspaper"></i> ${news.source}
                </span>
            </div>
            <div style="display: flex; gap: var(--space-6); flex-wrap: wrap; margin-bottom: var(--space-12);">
                ${news.tags.map(tag => `<span class="tag" style="font-size: var(--font-size-xs); padding: var(--space-2) var(--space-8);">#${tag}</span>`).join('')}
            </div>
            <div style="display: flex; gap: var(--space-8);">
                <button class="btn btn--primary btn--sm ripple" onclick="window.open('${news.url}', '_blank')" style="flex: 1;">
                    <i class="fas fa-external-link-alt"></i> Read More
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="shareNews(${news.id})" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="bookmarkNews(${news.id})" title="Bookmark">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function initTechEvents() {
    // Sample tech events data
    appData.techEvents = [
        {
            id: 1,
            title: "AI Summit 2025",
            date: "2025-12-15",
            endDate: "2025-12-17",
            location: "San Francisco, CA",
            type: "Conference",
            isVirtual: true,
            price: "Free",
            url: "https://aisummit2025.com",
            image: "https://via.placeholder.com/400x250/32808d/ffffff?text=AI+Summit",
            description: "Join industry leaders to explore the future of artificial intelligence and machine learning.",
            attendees: "5,000+",
            tags: ["AI", "ML", "Conference"]
        },
        {
            id: 2,
            title: "JavaScript World Conference",
            date: "2025-12-20",
            endDate: "2025-12-22",
            location: "Austin, TX",
            type: "Conference",
            isVirtual: false,
            price: "$299",
            url: "https://jsworld.com",
            image: "https://via.placeholder.com/400x250/21808d/ffffff?text=JS+World",
            description: "Three days of JavaScript workshops, talks, and networking with top developers.",
            attendees: "3,000+",
            tags: ["JavaScript", "Web Dev", "Networking"]
        },
        {
            id: 3,
            title: "DevOps Days Global",
            date: "2025-12-10",
            endDate: "2025-12-11",
            location: "Online",
            type: "Webinar",
            isVirtual: true,
            price: "Free",
            url: "https://devopsdays.org",
            image: "https://via.placeholder.com/400x250/1d6c78/ffffff?text=DevOps",
            description: "Learn best practices for continuous integration, deployment, and infrastructure automation.",
            attendees: "10,000+",
            tags: ["DevOps", "CI/CD", "Cloud"]
        },
        {
            id: 4,
            title: "Blockchain Developers Meetup",
            date: "2025-12-05",
            endDate: "2025-12-05",
            location: "New York, NY",
            type: "Meetup",
            isVirtual: false,
            price: "Free",
            url: "https://blockchaindevelopers.com",
            image: "https://via.placeholder.com/400x250/195c66/ffffff?text=Blockchain",
            description: "Monthly meetup for blockchain developers to share knowledge and network.",
            attendees: "200+",
            tags: ["Blockchain", "Web3", "Networking"]
        },
        {
            id: 5,
            title: "React Summit",
            date: "2026-01-15",
            endDate: "2026-01-16",
            location: "Amsterdam, Netherlands",
            type: "Conference",
            isVirtual: true,
            price: "$199",
            url: "https://reactsummit.com",
            image: "https://via.placeholder.com/400x250/154c54/ffffff?text=React",
            description: "The biggest React conference with talks from core team members and industry experts.",
            attendees: "4,000+",
            tags: ["React", "Frontend", "JavaScript"]
        },
        {
            id: 6,
            title: "Cybersecurity Workshop",
            date: "2025-12-08",
            endDate: "2025-12-08",
            location: "Online",
            type: "Workshop",
            isVirtual: true,
            price: "$49",
            url: "https://cybersecurityworkshop.com",
            image: "https://via.placeholder.com/400x250/0f3c42/ffffff?text=Security",
            description: "Hands-on workshop covering penetration testing, ethical hacking, and security best practices.",
            attendees: "500+",
            tags: ["Security", "Hacking", "Workshop"]
        }
    ];
    
    renderTechEvents();
}

function renderTechEvents() {
    const container = document.getElementById('eventsContainer');
    
    if (!container) return;
    
    if (appData.techEvents.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No upcoming tech events. Check back later!</p></div>';
        return;
    }
    
    // Sort events by date
    const sortedEvents = [...appData.techEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = sortedEvents.map(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= new Date();
        const isPast = !isUpcoming;
        
        return `
        <div class="card event-card ${isPast ? 'event-past' : ''}" style="animation: fadeIn 0.6s ease; overflow: hidden;">
            <div class="event-image" style="width: 100%; height: 180px; background: url('${event.image}') center/cover; border-radius: var(--radius-base); margin-bottom: var(--space-16); position: relative;">
                ${event.isVirtual ? '<span class="virtual-badge" style="position: absolute; top: var(--space-8); right: var(--space-8); background: var(--color-primary); color: var(--color-btn-primary-text); padding: var(--space-4) var(--space-8); border-radius: var(--radius-base); font-size: var(--font-size-xs); font-weight: 600;"><i class="fas fa-video"></i> Virtual</span>' : ''}
                ${isPast ? '<span class="past-badge" style="position: absolute; top: var(--space-8); left: var(--space-8); background: var(--color-text-secondary); color: white; padding: var(--space-4) var(--space-8); border-radius: var(--radius-base); font-size: var(--font-size-xs); font-weight: 600;">Past Event</span>' : ''}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
                <span class="tag" style="font-size: var(--font-size-xs);">${event.type}</span>
                <span style="font-size: var(--font-size-xs); font-weight: 600; color: ${event.price === 'Free' ? 'var(--color-success)' : 'var(--color-primary)'};">
                    ${event.price}
                </span>
            </div>
            
            <h3 style="margin-bottom: var(--space-12); line-height: 1.4;">${event.title}</h3>
            
            <div style="display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-12);">
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-calendar" style="width: 16px;"></i>
                    <span>${formatEventDate(event.date, event.endDate)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-map-marker-alt" style="width: 16px;"></i>
                    <span>${event.location}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-users" style="width: 16px;"></i>
                    <span>${event.attendees} attendees</span>
                </div>
            </div>
            
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-12); line-height: 1.6;">
                ${event.description}
            </p>
            
            <div style="display: flex; gap: var(--space-6); flex-wrap: wrap; margin-bottom: var(--space-12);">
                ${event.tags.map(tag => `<span class="tag" style="font-size: var(--font-size-xs); padding: var(--space-2) var(--space-8);">#${tag}</span>`).join('')}
            </div>
            
            <div style="display: flex; gap: var(--space-8);">
                <button class="btn ${isPast ? 'btn--secondary' : 'btn--primary'} btn--sm ripple" onclick="window.open('${event.url}', '_blank')" style="flex: 1;">
                    <i class="fas fa-${isPast ? 'eye' : 'ticket-alt'}"></i> ${isPast ? 'View Details' : 'Register Now'}
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="addEventToCalendar(${event.id})" title="Add to Calendar">
                    <i class="fas fa-calendar-plus"></i>
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="shareEvent(${event.id})" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

function formatEventDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (startDate === endDate) {
        return start.toLocaleDateString('en-US', options);
    } else {
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    }
}

function addEventToCalendar(eventId) {
    const event = appData.techEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Create ICS calendar format
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
URL:${event.url}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Added to calendar!', 'success', 2000);
}

function shareEvent(eventId) {
    const event = appData.techEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const shareText = `Check out ${event.title} - ${formatEventDate(event.date, event.endDate)} in ${event.location}`;
    
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: shareText,
            url: event.url
        }).then(() => {
            showNotification('Shared successfully!', 'success', 2000);
        }).catch(() => {
            copyToClipboard(event.url);
        });
    } else {
        copyToClipboard(event.url);
    }
}

function filterEventsByType(type) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    const filtered = type === 'all' 
        ? appData.techEvents 
        : appData.techEvents.filter(e => e.type === type);
    
    renderFilteredEvents(filtered);
}

function filterEventsByTime(timeFilter) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    const now = new Date();
    let filtered = appData.techEvents;
    
    if (timeFilter === 'upcoming') {
        filtered = appData.techEvents.filter(e => new Date(e.date) >= now);
    } else if (timeFilter === 'past') {
        filtered = appData.techEvents.filter(e => new Date(e.date) < now);
    }
    
    renderFilteredEvents(filtered);
}

function renderFilteredEvents(events) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No events found matching your filter.</p></div>';
        return;
    }
    
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = sortedEvents.map(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= new Date();
        const isPast = !isUpcoming;
        
        return `
        <div class="card event-card ${isPast ? 'event-past' : ''}" style="animation: fadeIn 0.6s ease; overflow: hidden;">
            <div class="event-image" style="width: 100%; height: 180px; background: url('${event.image}') center/cover; border-radius: var(--radius-base); margin-bottom: var(--space-16); position: relative;">
                ${event.isVirtual ? '<span class="virtual-badge" style="position: absolute; top: var(--space-8); right: var(--space-8); background: var(--color-primary); color: var(--color-btn-primary-text); padding: var(--space-4) var(--space-8); border-radius: var(--radius-base); font-size: var(--font-size-xs); font-weight: 600;"><i class="fas fa-video"></i> Virtual</span>' : ''}
                ${isPast ? '<span class="past-badge" style="position: absolute; top: var(--space-8); left: var(--space-8); background: var(--color-text-secondary); color: white; padding: var(--space-4) var(--space-8); border-radius: var(--radius-base); font-size: var(--font-size-xs); font-weight: 600;">Past Event</span>' : ''}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
                <span class="tag" style="font-size: var(--font-size-xs);">${event.type}</span>
                <span style="font-size: var(--font-size-xs); font-weight: 600; color: ${event.price === 'Free' ? 'var(--color-success)' : 'var(--color-primary)'};">
                    ${event.price}
                </span>
            </div>
            
            <h3 style="margin-bottom: var(--space-12); line-height: 1.4;">${event.title}</h3>
            
            <div style="display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-12);">
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-calendar" style="width: 16px;"></i>
                    <span>${formatEventDate(event.date, event.endDate)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-map-marker-alt" style="width: 16px;"></i>
                    <span>${event.location}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <i class="fas fa-users" style="width: 16px;"></i>
                    <span>${event.attendees} attendees</span>
                </div>
            </div>
            
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-12); line-height: 1.6;">
                ${event.description}
            </p>
            
            <div style="display: flex; gap: var(--space-6); flex-wrap: wrap; margin-bottom: var(--space-12);">
                ${event.tags.map(tag => `<span class="tag" style="font-size: var(--font-size-xs); padding: var(--space-2) var(--space-8);">#${tag}</span>`).join('')}
            </div>
            
            <div style="display: flex; gap: var(--space-8);">
                <button class="btn ${isPast ? 'btn--secondary' : 'btn--primary'} btn--sm ripple" onclick="window.open('${event.url}', '_blank')" style="flex: 1;">
                    <i class="fas fa-${isPast ? 'eye' : 'ticket-alt'}"></i> ${isPast ? 'View Details' : 'Register Now'}
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="addEventToCalendar(${event.id})" title="Add to Calendar">
                    <i class="fas fa-calendar-plus"></i>
                </button>
                <button class="btn btn--secondary btn--sm ripple" onclick="shareEvent(${event.id})" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `}).join('');
}