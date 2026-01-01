const API_BASE = '/api';
const feed = document.getElementById('feed');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const sourceTabs = document.getElementById('sourceTabs');

let currentSource = '';

// SVG icons for theme toggle
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';

  if (isDark) {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    updateThemeIcon(false);
  } else {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateThemeIcon(true);
  }
}

function updateThemeIcon(isDark) {
  const icon = themeToggle.querySelector('.theme-icon');
  icon.innerHTML = isDark ? sunIcon : moonIcon;
}

// Format relative time
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label}`;
    }
  }

  return 'now';
}

// Get source initials for icon
function getSourceInitials(source) {
  return source
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// Extract image URL from content HTML
function extractImageUrl(content, imageUrl) {
  if (imageUrl) return imageUrl;

  if (content) {
    const match = content.match(/src="([^"]+)"/);
    if (match) return match[1];
  }

  return null;
}

// Create wave SVG for placeholder
function createWavePlaceholder() {
  return `<svg viewBox="0 0 200 100" fill="none" style="width: 60px; height: 30px; opacity: 0.4;">
    <defs>
      <linearGradient id="placeholderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E8A832"/>
        <stop offset="40%" stop-color="#F5A623"/>
        <stop offset="100%" stop-color="#E89923"/>
      </linearGradient>
    </defs>
    <path d="M 20 80 Q 50 80, 70 50 Q 90 20, 110 50 Q 130 80, 160 20" stroke="url(#placeholderGradient)" stroke-width="8" stroke-linecap="round" fill="none"/>
  </svg>`;
}

// Handle image load error
function handleImageError(img) {
  const placeholder = document.createElement('div');
  placeholder.className = 'card-image placeholder';
  placeholder.innerHTML = createWavePlaceholder();
  img.replaceWith(placeholder);
}

// Create a card element
function createCard(article) {
  const card = document.createElement('article');
  card.className = 'card';
  card.onclick = () => window.open(article.url, '_blank');

  const imageUrl = extractImageUrl(article.content, article.imageUrl);
  const sourceInitials = getSourceInitials(article.source);
  const timeAgo = formatTimeAgo(article.publishedAt);
  const positivityPercent = Math.round(article.positivityScore * 100);

  // Clean description
  const cleanDescription = article.description
    .replace(/<[^>]*>/g, '')
    .replace(/\[\&hellip;\]/g, '...')
    .replace(/\[&#8230;\]/g, '...')
    .substring(0, 150);

  card.innerHTML = `
    <div class="card-content">
      <div class="card-source">
        <span class="source-icon">${sourceInitials}</span>
        <span class="source-name">${article.source}</span>
        <span class="source-dot">·</span>
        <span class="source-time">${timeAgo}</span>
      </div>
      <h2 class="card-title">${article.title}</h2>
      <p class="card-description">${cleanDescription}</p>
      <span class="card-score">${positivityPercent}%</span>
    </div>
  `;

  // Add image separately to handle errors properly
  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = imageUrl;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => handleImageError(img);
    card.insertBefore(img, card.firstChild);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-image placeholder';
    placeholder.innerHTML = createWavePlaceholder();
    card.insertBefore(placeholder, card.firstChild);
  }

  return card;
}

// Show empty state
function showEmptyState() {
  feed.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${createWavePlaceholder()}</div>
      <h2 class="empty-state-title">No stories yet</h2>
      <p>Positive news is on its way.</p>
    </div>
  `;
}

// Show error state
function showError(message) {
  feed.innerHTML = `
    <div class="error-state">
      <p>Unable to load news</p>
      <p style="margin-top: 8px; font-size: 13px; opacity: 0.7;">Pull down to retry</p>
    </div>
  `;
}

// Fetch and render news
async function loadNews(source = '') {
  try {
    feed.innerHTML = '';
    loading.classList.remove('hidden');
    feed.appendChild(loading);

    let url = `${API_BASE}/news?limit=50`;
    if (source) {
      url += `&source=${encodeURIComponent(source)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    loading.classList.add('hidden');

    if (!data.data || data.data.length === 0) {
      showEmptyState();
      return;
    }

    feed.innerHTML = '';

    for (const article of data.data) {
      const card = createCard(article);
      feed.appendChild(card);
    }

  } catch (error) {
    console.error('Failed to load news:', error);
    loading.classList.add('hidden');
    showError(error.message);
  }
}

// Handle source tab clicks
function handleSourceTabClick(e) {
  if (!e.target.classList.contains('source-tab')) return;

  document.querySelectorAll('.source-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  e.target.classList.add('active');

  currentSource = e.target.dataset.source;
  loadNews(currentSource);
}

// Pull-to-refresh
let touchStartY = 0;
let isPulling = false;

document.addEventListener('touchstart', (e) => {
  if (window.scrollY === 0) {
    touchStartY = e.touches[0].clientY;
    isPulling = true;
  }
});

document.addEventListener('touchmove', (e) => {
  if (!isPulling) return;
});

document.addEventListener('touchend', (e) => {
  if (!isPulling) return;

  const touchY = e.changedTouches[0].clientY;
  const pullDistance = touchY - touchStartY;

  if (pullDistance > 100 && window.scrollY === 0) {
    loadNews(currentSource);
  }

  isPulling = false;
});

// Event listeners
themeToggle.addEventListener('click', toggleTheme);
sourceTabs.addEventListener('click', handleSourceTabClick);

// Initialize
initTheme();
loadNews();
