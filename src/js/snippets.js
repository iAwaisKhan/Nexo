import { appData } from './state.js';
import { escapeHTML } from './utils.js';

export function renderSnippets() {
    const container = document.getElementById('snippetsContainer');
    if (!container) return;

    if (appData.snippets.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-code"></i><p>No code snippets yet. Add your first one!</p></div>';
        return;
    }
    
    container.innerHTML = appData.snippets.map(snippet => {
        const safeTitle = escapeHTML(snippet.title || 'Untitled snippet');
        const safeLanguage = escapeHTML(snippet.language || 'Code');
        const safeCode = escapeHTML(snippet.code || '');
        return `
            <div class="card" style="animation: fadeIn 0.6s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <h3>${safeTitle}</h3>
                    <span class="tag">${safeLanguage}</span>
                </div>
                <pre style="background: var(--bg-secondary); padding: var(--space-md); border-radius: var(--radius); overflow-x: auto;"><code>${safeCode}</code></pre>
            </div>
        `;
    }).join('');
}
