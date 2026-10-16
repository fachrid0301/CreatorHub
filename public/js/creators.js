/**
 * CreatorHub - Explore Creators Catalog Logic
 */

let allCreators = [];
let currentCategory = 'All';
let currentPlatform = 'All';
let currentTier = 'All';
let currentSort = 'followers-desc';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  // Ambil parameter kategori dari URL jika ada (?category=...)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    currentCategory = initialCategory;
  }

  setupEventListeners();
  loadCreators();
});

function setupEventListeners() {
  // Search input dengan debounce
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        filterAndRenderCreators();
      }, 250);
    });
  }

  // Filter Platform
  const platformFilter = document.getElementById('platformFilter');
  if (platformFilter) {
    platformFilter.addEventListener('change', (e) => {
      currentPlatform = e.target.value;
      filterAndRenderCreators();
    });
  }

  // Filter Tier Followers
  const tierFilter = document.getElementById('tierFilter');
  if (tierFilter) {
    tierFilter.addEventListener('change', (e) => {
      currentTier = e.target.value;
      filterAndRenderCreators();
    });
  }

  // Sorting
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      currentSort = e.target.value;
      filterAndRenderCreators();
    });
  }

  // Reset Filter Button
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'All';
      currentPlatform = 'All';
      currentTier = 'All';
      currentSort = 'followers-desc';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (platformFilter) platformFilter.value = 'All';
      if (tierFilter) tierFilter.value = 'All';
      if (sortFilter) sortFilter.value = 'followers-desc';
      updateCategoryTabs();
      filterAndRenderCreators();
    });
  }
}

async function loadCreators() {
  const grid = document.getElementById('creatorsGrid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
        <div style="display:inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 12px; font-weight: 500;">Memuat kreator dari Google Sheets...</p>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/creators');
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      allCreators = result.data;
      renderCategoryTabs(result.categories || []);
      filterAndRenderCreators();
    } else {
      throw new Error(result.message || 'Gagal memuat data kreator');
    }
  } catch (error) {
    console.error('Error memuat kreator:', error);
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">⚠️</div>
          <h3>Gagal Memuat Data</h3>
          <p>${error.message || 'Terjadi gangguan saat mengambil data. Silakan coba lagi.'}</p>
          <button class="btn btn-primary btn-sm" onclick="loadCreators()">Coba Lagi</button>
        </div>
      `;
    }
  }
}

function renderCategoryTabs(categories) {
  const container = document.getElementById('categoryTabsContainer');
  if (!container) return;

  const defaultCats = [
    'All',
    'Beauty & Fashion',
    'Tech & Gadget',
    'Food & Culinary',
    'Gaming & Esports',
    'Lifestyle & Travel',
    'Education & Business',
    'Health & Fitness'
  ];

  // Gabungkan kategori unik
  const uniqueCats = ['All', ...new Set([...defaultCats.slice(1), ...categories])];

  container.innerHTML = uniqueCats.map(cat => `
    <button class="category-tag-btn ${cat.toLowerCase() === currentCategory.toLowerCase() ? 'active' : ''}" data-cat="${cat}">
      ${cat === 'All' ? '🔥 Semua Kategori' : cat}
    </button>
  `).join('');

  container.querySelectorAll('.category-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat');
      updateCategoryTabs();
      filterAndRenderCreators();
    });
  });
}

function updateCategoryTabs() {
  document.querySelectorAll('#categoryTabsContainer .category-tag-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat.toLowerCase() === currentCategory.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function filterAndRenderCreators() {
  let filtered = [...allCreators];

  // Filter Kategori
  if (currentCategory && currentCategory !== 'All') {
    filtered = filtered.filter(c => c.category && c.category.toLowerCase() === currentCategory.toLowerCase());
  }

  // Filter Platform
  if (currentPlatform && currentPlatform !== 'All') {
    filtered = filtered.filter(c => c.platform && c.platform.toLowerCase() === currentPlatform.toLowerCase());
  }

  // Filter Follower Tier
  if (currentTier && currentTier !== 'All') {
    filtered = filtered.filter(c => {
      const f = Number(c.followers) || 0;
      switch (currentTier) {
        case 'nano': return f < 10000;
        case 'micro': return f >= 10000 && f < 100000;
        case 'macro': return f >= 100000 && f < 500000;
        case 'mega': return f >= 500000;
        default: return true;
      }
    });
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.bio && c.bio.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (currentSort === 'followers-asc') {
    filtered.sort((a, b) => (Number(a.followers) || 0) - (Number(b.followers) || 0));
  } else if (currentSort === 'name-asc') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    // Default: followers-desc
    filtered.sort((a, b) => (Number(b.followers) || 0) - (Number(a.followers) || 0));
  }

  // Update total count indicator
  const countIndicator = document.getElementById('resultsCountIndicator');
  if (countIndicator) {
    countIndicator.textContent = `Menampilkan ${filtered.length} kreator`;
  }

  const grid = document.getElementById('creatorsGrid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h3>Kreator Tidak Ditemukan</h3>
        <p>Coba gunakan kata kunci pencarian lain atau ubah filter kategori & platform.</p>
        <button class="btn btn-outline btn-sm" id="emptyResetBtn">Reset Semua Filter</button>
      </div>
    `;
    const emptyReset = document.getElementById('emptyResetBtn');
    if (emptyReset) {
      emptyReset.addEventListener('click', () => {
        document.getElementById('resetFiltersBtn')?.click();
      });
    }
    return;
  }

  grid.innerHTML = filtered.map(creator => createCreatorCardHTML(creator)).join('');

  // Pasang listener pada tombol "Lihat Detail"
  grid.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const creator = allCreators.find(c => c.id === id);
      if (creator) openDetailModal(creator);
    });
  });
}

function createCreatorCardHTML(c) {
  const avatar = c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  const followersFormatted = formatFollowers(c.followers);
  const platformBadge = getPlatformBadge(c.platform);

  return `
    <div class="creator-card">
      <div class="creator-header-bg"></div>
      <div class="creator-card-body">
        <div class="creator-avatar-wrap">
          <img src="${avatar}" alt="${c.name}" class="creator-avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'" />
          <div class="creator-platform-badge">
            ${c.platform.toLowerCase().includes('tiktok') ? '🎵' : c.platform.toLowerCase().includes('youtube') ? '▶️' : '📸'}
          </div>
        </div>

        <div class="creator-name">
          <span>${c.name}</span>
          <svg class="verified-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="creator-handle">${c.username}</div>

        <div class="creator-badges">
          <span class="badge badge-orange">${c.category || 'Influencer'}</span>
          ${platformBadge}
        </div>

        <p class="creator-bio">${c.bio || 'Kreator konten profesional siap berkolaborasi untuk berbagai campaign brand.'}</p>

        <div class="creator-meta-stats">
          <div class="meta-stat-item">
            <span class="meta-stat-label">Followers</span>
            <span class="meta-stat-value">${followersFormatted}</span>
          </div>
          <div class="meta-stat-item" style="text-align: right;">
            <span class="meta-stat-label">Rate Mulai</span>
            <span class="meta-stat-value" style="color: var(--color-primary);">${c.rateCard || 'Hubungi Kami'}</span>
          </div>
        </div>

        <div class="creator-card-actions">
          <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${c.id}">
            Lihat Detail
          </button>
          <a href="https://wa.me/${formatWaNumber(c.whatsapp)}?text=${encodeURIComponent(`Halo ${c.name}, saya melihat profil Anda di CreatorHub dan tertarik untuk berdiskusi mengenai endorsement / kolaborasi brand.`)}" target="_blank" class="btn btn-primary btn-sm">
            Chat WA
          </a>
        </div>
      </div>
    </div>
  `;
}

function formatWaNumber(wa) {
  if (!wa) return '';
  let cleaned = wa.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

// Modal Detail Kreator
function openDetailModal(c) {
  let modal = document.getElementById('creatorDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'creatorDetailModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const followersFormatted = formatFollowers(c.followers);
  const waNumber = formatWaNumber(c.whatsapp);
  const waChatUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${c.name}, saya menemukan profil Anda di CreatorHub dan ingin mendiskusikan peluang kolaborasi campaign brand.`)}`;

  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3 style="font-size: 1.15rem;">Detail Profil Kreator</h3>
        <button class="modal-close-btn" onclick="closeDetailModal()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
          <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-primary);" alt="${c.name}">
          <div>
            <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 8px;">
              ${c.name}
              <svg style="width: 18px; height: 18px; color: var(--color-info);" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </h2>
            <div style="color: var(--color-text-muted); font-size: 0.95rem;">${c.username}</div>
            <div style="margin-top: 6px; display: flex; gap: 8px;">
              <span class="badge badge-orange">${c.category}</span>
              ${getPlatformBadge(c.platform)}
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: var(--color-bg); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase;">Total Followers</div>
            <div style="font-size: 1.15rem; font-weight: 800;">${followersFormatted}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase;">Estimasi Rate Card</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary);">${c.rateCard || 'Negosiasi'}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.95rem; margin-bottom: 6px;">Tentang Kreator / Bio</h4>
          <p style="font-size: 0.92rem; color: var(--color-text-secondary); line-height: 1.6;">${c.bio || 'Tidak ada deskripsi tambahan.'}</p>
        </div>

        ${c.portfolio ? `
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 0.95rem; margin-bottom: 6px;">Media Kit / Portofolio</h4>
            <a href="${c.portfolio}" target="_blank" class="btn btn-secondary btn-sm" style="display: inline-flex; width: auto;">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Buka Link Portofolio
            </a>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeDetailModal()">Tutup</button>
        <a href="${waChatUrl}" target="_blank" class="btn btn-primary">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          Hubungi via WhatsApp
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDetailModal();
  });
}

function closeDetailModal() {
  const modal = document.getElementById('creatorDetailModal');
  if (modal) modal.classList.remove('active');
}
