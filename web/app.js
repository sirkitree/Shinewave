const API_BASE = '/api';
const feed = document.getElementById('feed');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const sourceList = document.getElementById('sourceList');
const selectAllBtn = document.getElementById('selectAllBtn');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sourceCount = document.getElementById('sourceCount');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');

let selectedSources = new Set();
let allArticles = [];

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
      <span class="card-score" title="Positivity score based on AI sentiment analysis">
        <svg class="score-icon" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        ${positivityPercent}% positive
      </span>
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

// Fetch sources from API and render them
async function loadSources() {
  try {
    const response = await fetch(`${API_BASE}/sources`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const saved = localStorage.getItem('selectedSources');
    const savedSources = saved ? JSON.parse(saved) : null;

    sourceList.innerHTML = data.sources.map(source => {
      const isChecked = savedSources ? savedSources.includes(source.name) : true;
      if (isChecked) selectedSources.add(source.name);
      return `
        <label class="source-item">
          <input type="checkbox" data-source="${source.name}" ${isChecked ? 'checked' : ''}>
          <span class="source-checkbox"></span>
          <span class="source-label">${source.name}</span>
        </label>
      `;
    }).join('');

    updateSourceCount();
    updateSelectAllButton();
  } catch (error) {
    console.error('Failed to load sources:', error);
  }
}

// Initialize selected sources from localStorage or defaults
function initSelectedSources() {
  const saved = localStorage.getItem('selectedSources');
  const checkboxes = sourceList.querySelectorAll('input[type="checkbox"]');

  if (saved) {
    // Restore from localStorage
    const savedSources = JSON.parse(saved);
    checkboxes.forEach(cb => {
      const isSelected = savedSources.includes(cb.dataset.source);
      cb.checked = isSelected;
      if (isSelected) {
        selectedSources.add(cb.dataset.source);
      }
    });
  } else {
    // Use defaults (all checked)
    checkboxes.forEach(cb => {
      if (cb.checked) {
        selectedSources.add(cb.dataset.source);
      }
    });
  }

  updateSourceCount();
  updateSelectAllButton();
}

// Save selected sources to localStorage
function saveSelectedSources() {
  localStorage.setItem('selectedSources', JSON.stringify([...selectedSources]));
}

// Update source count display
function updateSourceCount() {
  const total = sourceList.querySelectorAll('input[type="checkbox"]').length;
  const selected = selectedSources.size;
  sourceCount.textContent = `${selected}/${total} sources`;
}

// Update select all button text
function updateSelectAllButton() {
  const checkboxes = sourceList.querySelectorAll('input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  selectAllBtn.textContent = allChecked ? 'Deselect All' : 'Select All';
}

// Fetch all news
async function loadNews() {
  try {
    feed.innerHTML = '';
    loading.classList.remove('hidden');
    feed.appendChild(loading);

    const response = await fetch(`${API_BASE}/news?limit=100`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    allArticles = data.data || [];

    loading.classList.add('hidden');
    renderFilteredArticles();

  } catch (error) {
    console.error('Failed to load news:', error);
    loading.classList.add('hidden');
    showError(error.message);
  }
}

// Render articles based on selected sources
function renderFilteredArticles() {
  const filtered = allArticles.filter(article => selectedSources.has(article.source));

  if (filtered.length === 0) {
    if (selectedSources.size === 0) {
      feed.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${createWavePlaceholder()}</div>
          <h2 class="empty-state-title">No sources selected</h2>
          <p>Select at least one source to see stories.</p>
        </div>
      `;
    } else {
      showEmptyState();
    }
    return;
  }

  feed.innerHTML = '';
  for (const article of filtered) {
    const card = createCard(article);
    feed.appendChild(card);
  }
}

// Handle source checkbox changes
function handleSourceChange(e) {
  if (e.target.type !== 'checkbox') return;

  const source = e.target.dataset.source;
  if (e.target.checked) {
    selectedSources.add(source);
  } else {
    selectedSources.delete(source);
  }

  updateSourceCount();
  updateSelectAllButton();
  saveSelectedSources();
  renderFilteredArticles();
}

// Handle select all / deselect all
function handleSelectAll() {
  const checkboxes = sourceList.querySelectorAll('input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);

  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
    if (!allChecked) {
      selectedSources.add(cb.dataset.source);
    } else {
      selectedSources.delete(cb.dataset.source);
    }
  });

  updateSourceCount();
  updateSelectAllButton();
  saveSelectedSources();
  renderFilteredArticles();
}

// Mobile sidebar toggle
function toggleSidebar() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('visible');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
}

// Desktop sidebar collapse/expand
function initSidebarState() {
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }
}

function collapseSidebar() {
  sidebar.classList.add('collapsed');
  localStorage.setItem('sidebarCollapsed', 'true');
}

function expandSidebar() {
  sidebar.classList.remove('collapsed');
  localStorage.setItem('sidebarCollapsed', 'false');
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
    loadNews();
  }

  isPulling = false;
});

// Event listeners
themeToggle.addEventListener('click', toggleTheme);
sourceList.addEventListener('change', handleSourceChange);
selectAllBtn.addEventListener('click', handleSelectAll);
sidebarToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
sidebarCollapseBtn.addEventListener('click', collapseSidebar);
sidebarExpandBtn.addEventListener('click', expandSidebar);

// Initialize
initTheme();
initSidebarState();
loadSources().then(() => loadNews());
