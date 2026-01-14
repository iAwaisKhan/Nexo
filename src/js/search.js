import { appData } from './state.js';
import { showNotification } from './utils.js';
import { saveAllData } from './storage.js';

let searchTimeout = null;

export function handleSearch(event) {
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
        saveAllData();
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
    showNotification(`Found ${results.notes.length + results.tasks.length} results for "${query}"`, 'info', 2000);
    // Modal display logic omitted for brevity in this example
}
