import { appData, TechNews, TechEvent } from './state.ts';
import { escapeHTML } from './utils.ts';

export function initTechNews(): void {
  appData.techNews = [
    { id: 1, title: "AI Breakthrough: New Language Model Surpasses GPT-4", category: "AI/ML", description: "Researchers announce a groundbreaking AI model with enhanced reasoning capabilities.", link: "#" },
    { id: 2, title: "JavaScript Framework Wars: The Rise of New Contenders", category: "Web Dev", description: "New lightweight frameworks are challenging React and Vue's dominance.", link: "#" }
  ];
  renderTechNews();
}

export function renderTechNews(newsToRender?: TechNews[] | null): void {
  const container = document.getElementById('newsContainer');
  if (!container) return;

  const newsItems = newsToRender || appData.techNews;
  if (newsItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No tech news available.</div>';
    return;
  }

  container.innerHTML = newsItems.map((news: TechNews) => {
    const safeTitle = escapeHTML(news.title);
    const safeCategory = escapeHTML(news.category);
    const safeDescription = escapeHTML(news.description);
    return `
      <div class="card news-card">
        <span class="tag">${safeCategory}</span>
        <h3>${safeTitle}</h3>
        <p>${safeDescription}</p>
      </div>
    `;
  }).join('');
}

export function filterNewsByCategory(category: string): void {
  if (category === 'all') {
    renderTechNews();
  } else {
    const filtered = appData.techNews.filter((n: TechNews) => n.category === category);
    renderTechNews(filtered);
  }
}

export function initTechEvents(): void {
  appData.techEvents = [
    { id: 1, title: "Global Developer Conference", date: "2026-03-15", type: "Conference", location: "Online" },
    { id: 2, title: "Web Performance Webinar", date: "2026-01-20", type: "Webinar", location: "Live Stream" }
  ];
  renderTechEvents();
}

export function renderTechEvents(eventsToRender?: TechEvent[] | null): void {
  const container = document.getElementById('eventsContainer');
  if (!container) return;

  const events = eventsToRender || appData.techEvents;
  if (events.length === 0) {
    container.innerHTML = '<div class="empty-state">No tech events found.</div>';
    return;
  }

  container.innerHTML = events.map((event: TechEvent) => {
    const safeTitle = escapeHTML(event.title);
    const safeDate = escapeHTML(event.date);
    const safeType = escapeHTML(event.type);
    const safeLocation = escapeHTML(event.location);
    return `
      <div class="card event-card">
        <span class="tag">${safeType}</span>
        <h3>${safeTitle}</h3>
        <p><i class="fas fa-calendar"></i> ${safeDate}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${safeLocation}</p>
      </div>
    `;
  }).join('');
}

export function filterEventsByType(type: string): void {
  if (type === 'all') {
    renderTechEvents();
  } else {
    const filtered = appData.techEvents.filter((e: TechEvent) => e.type === type);
    renderTechEvents(filtered);
  }
}

export function filterEventsByTime(timeFrame: string): void {
  const now = new Date();
  let filtered = [...appData.techEvents];
  if (timeFrame === 'upcoming') {
    filtered = filtered.filter((e: TechEvent) => new Date(e.date) >= now);
  } else if (timeFrame === 'past') {
    filtered = filtered.filter((e: TechEvent) => new Date(e.date) < now);
  }
  renderTechEvents(filtered);
}
