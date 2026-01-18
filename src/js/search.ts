import { appData } from './state.ts';
import { showNotification } from './utils.ts';
import { saveAllData } from './storage.ts';

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export function handleSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  const query = input.value.toLowerCase().trim();

  clearTimeout(searchTimeout as any);
  searchTimeout = setTimeout(() => {
    if (query.length > 0) {
      addToSearchHistory(query);
      performGlobalSearch(query);
    }
  }, 300) as any;
}

function addToSearchHistory(query: string): void {
  if (!appData.searchHistory.includes(query)) {
    appData.searchHistory.unshift(query);
    if (appData.searchHistory.length > 10) {
      appData.searchHistory = appData.searchHistory.slice(0, 10);
    }
    saveAllData();
  }
}

function performGlobalSearch(query: string): void {
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

function showSearchResults(results: any, query: string): void {
  showNotification(`Found ${results.notes.length + results.tasks.length} results for "${query}"`, 'info', 2000);
  // Modal display logic omitted for brevity in this example
}
