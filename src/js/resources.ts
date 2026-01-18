import { appData, Resource } from './state.ts';
import { escapeHTML, escapeForSingleQuote, showNotification } from './utils.ts';

export function renderResources(resourcesToRender?: Resource[] | null): void {
  const container = document.getElementById('resourcesContainer');
  if (!container) return;

  const resources = resourcesToRender || appData.resources;

  if (resources.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No resources found. Try adjusting your filters!</p></div>';
    updateResourceCount(0);
    return;
  }

  container.innerHTML = resources.map((resource: Resource, index: number) => {
    const safeTitle = escapeHTML(resource.title || 'Resource');
    const safeDescription = escapeHTML(resource.description || '');
    const safeUrlDisplay = escapeHTML(resource.url || '');
    const escapedUrlForJS = escapeForSingleQuote(resource.url || '#');
    const safeTags = (resource.tags || []).slice(0, 4).map((tag: string) => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
    const moreTags = resource.tags && resource.tags.length > 4 ? `<span class="tag">+${resource.tags.length - 4}</span>` : '';
    const safeCategory = escapeHTML(resource.category || 'Resource');
    const categoryIcon = getCategoryIcon(resource.category);
    const categoryColor = getCategoryColor(resource.category);

    return `
      <div class="card resource-card" style="animation: fadeIn 0.6s ease ${index * 0.05}s; animation-fill-mode: both; opacity: 0;" onclick="window.open('${escapedUrlForJS}', '_blank')">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <div class="resource-category-icon" style="background: ${categoryColor}15; color: ${categoryColor};">
              <i class="fas ${categoryIcon}"></i>
            </div>
            <span class="resource-category-badge" style="background: ${categoryColor}15; color: ${categoryColor};">${safeCategory}</span>
          </div>
          <button class="btn-icon ripple" onclick="event.stopPropagation(); bookmarkResource(${resource.id})" title="Bookmark" style="opacity: 0.6;">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>

        <h3 style="margin-bottom: var(--space-sm); color: var(--color-text);">${safeTitle}</h3>

        ${resource.description ? `<p style="color: var(--color-text-secondary); margin-bottom: var(--space-md); font-size: var(--font-size-sm); line-height: 1.5;">${safeDescription}</p>` : ''}

        <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--color-text-secondary); font-size: var(--font-size-sm);">
          <i class="fas fa-external-link-alt"></i>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeUrlDisplay}</span>
        </div>

        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
          ${safeTags}
          ${moreTags}
        </div>
      </div>
    `;
  }).join('');

  updateResourceCount(resources.length);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
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

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
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

export function updateResourceCount(count: number): void {
  const countElement = document.getElementById('resourceCount');
  if (countElement) {
    countElement.textContent = `Showing ${count} resource${count !== 1 ? 's' : ''} of ${appData.resources.length} total`;
  }
}

export function filterResources(): void {
  const searchTerm = (document.getElementById('resourceSearch') as HTMLInputElement)?.value.toLowerCase() || '';
  const categoryFilter = (document.getElementById('resourceCategoryFilter') as HTMLSelectElement)?.value || 'all';

  let filtered = appData.resources;

  if (categoryFilter !== 'all') {
    filtered = filtered.filter((r: Resource) => r.category === categoryFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter((r: Resource) => {
      return r.title.toLowerCase().includes(searchTerm) ||
        r.url.toLowerCase().includes(searchTerm) ||
        r.category.toLowerCase().includes(searchTerm) ||
        (r.description && r.description.toLowerCase().includes(searchTerm)) ||
        r.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm));
    });
  }

  renderResources(filtered);
}

export function bookmarkResource(_id: number): void {
  showNotification('Resource bookmarked!', 'success');
}

export function showResourceEditor(): void {
  showNotification('Resource editor coming soon!', 'info');
}

export function resetResourceFilters(): void {
  const searchInput = document.getElementById('resourceSearch') as HTMLInputElement;
  const categorySelect = document.getElementById('resourceCategoryFilter') as HTMLSelectElement;

  if (searchInput) searchInput.value = '';
  if (categorySelect) categorySelect.value = 'all';

  renderResources();
  showNotification('Filters reset', 'success');
}
