export function escapeHTML(value = '') {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeForSingleQuote(value = '') {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}

export function ensureArray(value, fallback = []) {
    return Array.isArray(value) ? value : fallback;
}

export function ensureObject(value, fallback = {}) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    return fallback;
}

export function showNotification(message, type = 'info', duration = 3000) {
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
