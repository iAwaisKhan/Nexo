import { appData } from './state.js';
import { escapeHTML } from './utils.js';

export function renderNotes() {
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    if (appData.notes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>No notes yet. Create your first one!</p></div>';
        return;
    }
    
    container.innerHTML = appData.notes.map(note => {
        const safeTitle = escapeHTML(note.title || 'Untitled note');
        const safeContent = escapeHTML((note.content || '').substring(0, 100));
        const safeTags = (note.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
        return `
            <div class="card" style="cursor: pointer; animation: fadeIn 0.6s ease;">
                <h3 style="margin-bottom: var(--space-sm);">${safeTitle}</h3>
                <p style="color: var(--text-secondary); margin-bottom: var(--space-md);">${safeContent}...</p>
                <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                    ${safeTags}
                </div>
            </div>
        `;
    }).join('');
}
