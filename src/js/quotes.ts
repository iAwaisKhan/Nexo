import { quotes } from './state.ts';

export function displayRandomQuote(): void {
  const quoteElement = document.getElementById('randomQuote');
  const authorElement = document.getElementById('quoteAuthor');
  if (!quoteElement || !authorElement) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteElement.textContent = `"${quote.text}"`;
  authorElement.textContent = `- ${quote.author}`;
}
