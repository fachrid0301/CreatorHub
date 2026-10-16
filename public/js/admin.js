/**
 * CreatorHub - Admin Dashboard Logic
 */

const TOKEN_KEY = 'creatorhub_admin_token';
let adminCreators = [];
let currentAdminStatus = 'All';
let adminSearchQuery = '';
let selectedCreatorForEdit = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndInit();
  setupAdminListeners();
});

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function checkAuthAndInit() {
  const token = getAuthToken();
  const loginOverlay = document.getElementById('adminLoginOverlay');
  const mainContent = document.getElementById('adminDashboardContent');

  if (!token) {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
  } else {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    loadDashboardData();
  }
}

function setupAdminListeners() {
  // Login Form Submission
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('adminUsername').value.trim();
      const passwordInput = document.getElementById('adminPassword').value.trim();
      const loginBtn = document.getElementById('adminLoginSubmitBtn');

      if (!usernameInput || !passwordInput) {
        showToast('Username dan password wajib diisi!', 'warning');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = 'Memverifikasi...';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        const result = await res.json();

        if (res.ok && result.success && result.token) {
          localStorage.setItem(TOKEN_KEY, result.token);
          showToast('Login berhasil! Selamat datang Admin.', 'success');
          checkAuthAndInit();
        } else {
          showToast(result.message || 'Login gagal!', 'error');
        }
      } catch (err) {
        showToast('Koneksi server gagal. Periksa koneksi lokal.', 'error');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk ke Dashboard';
      }
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
        localStorage.removeItem(TOKEN_KEY);
        checkAuthAndInit();
        showToast('Anda telah logout.', 'info');
      }
    });
  }

  // Search input
  const searchInput = document.getElementById('adminTableSearch');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        adminSearchQuery = e.target.value.trim().toLowerCase();
        filterAndRenderTable();
      }, 200);
    });
  }

  // Status Filter Tabs
  document.querySelectorAll('.status-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAdminStatus = btn.getAttribute('data-status');
      filterAndRenderTable();
    });
  });

  // Refresh Sync Button
  const refreshBtn = document.getElementById('adminRefreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboardData(true);
    });
  }

  // Export CSV Button
  const exportBtn = document.getElementById('adminExportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  // Form Edit Creator Submission
  const editForm = document.getElementById('editCreatorForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditCreatorSubmit);
  }
}

// Fetch Stats and Creator list
async function loadDashboardData(showNotice = false) {
  const token = getAuthToken();
  if (!token) return;

  try {
    // 1. Fetch Stats & Connection
    const statsRes = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (statsRes.status === 401 || statsRes.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      checkAuthAndInit();
      showToast('Sesi Anda telah kedaluwarsa. Silakan login kembali.', 'warning');
      return;
    }

    const statsData = await statsRes.json();
    if (statsData.success) {
      updateStatsUI(statsData.stats);
      updateConnectionUI(statsData.connection);
    }

    // 2. Fetch All Creators
    const creatorsRes = await fetch('/api/admin/creators', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const creatorsData = await creatorsRes.json();
    if (creatorsData.success) {
      adminCreators = creatorsData.data || [];
      filterAndRenderTable();
      if (showNotice) {
        showToast('Data berhasil disinkronkan dengan Google Sheets!', 'success');
      }
    }
  } catch (error) {
    console.error('Error dashboard:', error);
    showToast('Gagal memuat data dari server.', 'error');
  }
}

function updateStatsUI(stats) {
  if (!stats) return;
  document.getElementById('statTotalCreators').textContent = stats.total || 0;
  document.getElementById('statPendingCreators').textContent = stats.pending || 0;
  document.getElementById('statApprovedCreators').textContent = stats.approved || 0;
  document.getElementById('statRejectedCreators').textContent = stats.rejected || 0;
  document.getElementById('statTotalReach').textContent = formatFollowers(stats.totalReach || 0);
}

function updateConnectionUI(conn) {
  const pill = document.getElementById('sheetConnectionPill');
  const label = document.getElementById('sheetConnectionLabel');
  if (!pill || !label) return;

  if (conn && conn.connected) {
    pill.className = 'connection-pill connected';
    label.textContent = `Google Sheets Live (${conn.sheetName})`;
    pill.title = `Terkoneksi ke Spreadsheet ID: ${conn.spreadsheetId}`;
  } else {
    pill.className = 'connection-pill disconnected';
    label.textContent = 'Mode Penyimpanan Lokal (Siap Hubungkan .env)';
    pill.title = 'Isi GOOGLE_SHEET_ID dan Service Account di .env untuk sinkronisasi live Google Sheets';
  }
}

function filterAndRenderTable() {
  let filtered = [...adminCreators];

  // Filter status tab
  if (currentAdminStatus !== 'All') {
    filtered = filtered.filter(c => (c.status || '').toLowerCase() === currentAdminStatus.toLowerCase());
  }

  // Filter search
  if (adminSearchQuery) {
    filtered = filtered.filter(c =>
      (c.name && c.name.toLowerCase().includes(adminSearchQuery)) ||
      (c.username && c.username.toLowerCase().includes(adminSearchQuery)) ||
      (c.email && c.email.toLowerCase().includes(adminSearchQuery)) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(adminSearchQuery)) ||
      (c.category && c.category.toLowerCase().includes(adminSearchQuery))
    );
  }

  const tbody = document.getElementById('adminTableBody');
  const tableCountEl = document.getElementById('adminTableCount');
  if (tableCountEl) {
    tableCountEl.textContent = `Total: ${filtered.length} kreator`;
  }

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px 20px; color: var(--color-text-muted);">
          Tidak ada data kreator yang sesuai dengan filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr data-id="${c.id}">
      <td>
        <div class="creator-cell">
          <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}" class="creator-cell-avatar" alt="${c.name}">
          <div class="creator-cell-info">
            <span class="creator-cell-name">${c.name}</span>
            <span class="creator-cell-date">${c.createdAt ? c.createdAt.split(' ')[0] : '-'}</span>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 600;">${c.username}</div>
        <div style="margin-top: 4px;">${getPlatformBadge(c.platform)}</div>
      </td>
      <td>
        <span class="badge badge-orange">${c.category || 'General'}</span>
      </td>
      <td>
        <strong style="font-size: 0.95rem;">${formatFollowers(c.followers)}</strong>
      </td>
      <td>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">${c.rateCard || '-'}</div>
        ${c.portfolio ? `
          <a href="${c.portfolio}" target="_blank" style="font-size: 0.78rem; color: var(--color-primary); text-decoration: underline;">
            Lihat Portofolio
          </a>
        ` : '<span style="font-size: 0.75rem; color: var(--color-text-muted);">-</span>'}
      </td>
      <td>
        <select class="table-status-select ${c.status || 'Pending'}" onchange="changeCreatorStatus('${c.id}', this.value)">
          <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Approved" ${c.status === 'Approved' ? 'selected' : ''}>✅ Approved</option>
          <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>❌ Rejected</option>
        </select>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Lihat Detail Lengkap" onclick="viewCreatorDetail('${c.id}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button class="action-btn" title="Edit Data Kreator" onclick="openEditModal('${c.id}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn delete-btn" title="Hapus Kreator" onclick="confirmDeleteCreator('${c.id}', '${c.name.replace(/'/g, "\\'")}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Update Status Kreator secara langsung dari dropdown
async function changeCreatorStatus(id, newStatus) {
  const token = getAuthToken();
  if (!token) return;

  try {
    const res = await fetch(`/api/admin/creators/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast(`Status kreator berhasil diubah menjadi ${newStatus}!`, 'success');
      // Update data di local array
      const idx = adminCreators.findIndex(c => c.id === id);
      if (idx !== -1) {
        adminCreators[idx].status = newStatus;
      }
      loadDashboardData();
    } else {
      showToast(result.message || 'Gagal mengubah status', 'error');
      loadDashboardData();
    }
  } catch (err) {
    showToast('Koneksi gagal saat mengubah status.', 'error');
  }
}

// Modal View Detail Lengkap Admin
function viewCreatorDetail(id) {
  const c = adminCreators.find(item => item.id === id);
  if (!c) return;

  let modal = document.getElementById('adminDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adminDetailModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const cleanWa = (c.whatsapp || '').replace(/\D/g, '');
  const waFormatted = cleanWa.startsWith('0') ? '62' + cleanWa.substring(1) : cleanWa;

  modal.innerHTML = `
    <div class="modal-container" style="max-width: 620px;">
      <div class="modal-header">
        <h3>Detail Lengkap Pendaftar (#${c.id})</h3>
        <button class="modal-close-btn" onclick="closeAdminDetailModal()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
          <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;">
          <div>
            <h2 style="font-size: 1.3rem;">${c.name}</h2>
            <div style="color: var(--color-text-muted); font-size: 0.9rem;">${c.username} (${c.platform})</div>
            <div style="margin-top: 6px;">
              <span class="badge ${c.status === 'Approved' ? 'badge-approved' : c.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}">${c.status}</span>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background: var(--color-bg); padding: 16px; border-radius: var(--radius-md);">
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">EMAIL</span>
            <strong><a href="mailto:${c.email}" style="color: var(--color-primary);">${c.email}</a></strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">WHATSAPP</span>
            <strong>${c.whatsapp}</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">JUMLAH FOLLOWERS</span>
            <strong>${formatFollowers(c.followers)} (${Number(c.followers).toLocaleString('id-ID')})</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">KATEGORI</span>
            <strong>${c.category}</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">RATE CARD</span>
            <strong>${c.rateCard || '-'}</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">TANGGAL PENDAFTARAN</span>
            <strong>${c.createdAt || '-'}</strong>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Deskripsi / Bio</h4>
          <p style="font-size: 0.9rem; line-height: 1.6; background: #FFF; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">${c.bio || '-'}</p>
        </div>

        ${c.portfolio ? `
          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Portofolio / Media Kit</h4>
            <a href="${c.portfolio}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex;">Buka Link Eksternal ↗</a>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeAdminDetailModal()">Tutup</button>
        <a href="https://wa.me/${waFormatted}?text=${encodeURIComponent(`Halo ${c.name}, kami dari tim admin CreatorHub terkait pendaftaran kreator Anda.`)}" target="_blank" class="btn btn-primary">
          Hubungi Pendaftar via WA
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAdminDetailModal();
  });
}

function closeAdminDetailModal() {
  const modal = document.getElementById('adminDetailModal');
  if (modal) modal.classList.remove('active');
}

// Modal Edit Creator
function openEditModal(id) {
  const c = adminCreators.find(item => item.id === id);
  if (!c) return;
  selectedCreatorForEdit = c;

  document.getElementById('editCreatorId').value = c.id;
  document.getElementById('editName').value = c.name || '';
  document.getElementById('editEmail').value = c.email || '';
  document.getElementById('editWhatsapp').value = c.whatsapp || '';
  document.getElementById('editPlatform').value = c.platform || 'Instagram';
  document.getElementById('editUsername').value = c.username || '';
  document.getElementById('editFollowers').value = c.followers || 0;
  document.getElementById('editCategory').value = c.category || 'Beauty & Fashion';
  document.getElementById('editRateCard').value = c.rateCard || '';
  document.getElementById('editPortfolio').value = c.portfolio || '';
  document.getElementById('editBio').value = c.bio || '';
  document.getElementById('editStatus').value = c.status || 'Pending';

  const modal = document.getElementById('adminEditModal');
  if (modal) modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('adminEditModal');
  if (modal) modal.classList.remove('active');
}

async function handleEditCreatorSubmit(e) {
  e.preventDefault();
  const token = getAuthToken();
  if (!token || !selectedCreatorForEdit) return;

  const id = document.getElementById('editCreatorId').value;
  const updatePayload = {
    name: document.getElementById('editName').value.trim(),
    email: document.getElementById('editEmail').value.trim(),
    whatsapp: document.getElementById('editWhatsapp').value.trim(),
    platform: document.getElementById('editPlatform').value,
    username: document.getElementById('editUsername').value.trim(),
    followers: parseInt(document.getElementById('editFollowers').value, 10) || 0,
    category: document.getElementById('editCategory').value,
    rateCard: document.getElementById('editRateCard').value.trim(),
    portfolio: document.getElementById('editPortfolio').value.trim(),
    bio: document.getElementById('editBio').value.trim(),
    status: document.getElementById('editStatus').value
  };

  const saveBtn = document.getElementById('editSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Menyimpan...';

  try {
    const res = await fetch(`/api/admin/creators/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatePayload)
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast('Data kreator berhasil diperbarui di Google Sheets!', 'success');
      closeEditModal();
      loadDashboardData();
    } else {
      showToast(result.message || 'Gagal memperbarui data', 'error');
    }
  } catch (err) {
    showToast('Koneksi gagal saat memperbarui kreator.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Simpan Perubahan';
  }
}

// Konfirmasi & Hapus Kreator
async function confirmDeleteCreator(id, name) {
  const token = getAuthToken();
  if (!token) return;

  if (!confirm(`Apakah Anda yakin ingin MENGHAPUS kreator "${name}" (#${id}) dari Google Sheets? Tindakan ini tidak dapat dibatalkan.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/creators/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast(result.message || 'Kreator berhasil dihapus dari Google Sheets!', 'success');
      adminCreators = adminCreators.filter(c => c.id !== id);
      filterAndRenderTable();
      loadDashboardData();
    } else {
      showToast(result.message || 'Gagal menghapus data', 'error');
    }
  } catch (err) {
    showToast('Koneksi gagal saat menghapus data.', 'error');
  }
}

// Ekspor ke format CSV
function exportToCSV() {
  if (adminCreators.length === 0) {
    showToast('Tidak ada data kreator untuk diekspor.', 'warning');
    return;
  }

  const headers = ['ID', 'Nama', 'Email', 'WhatsApp', 'Platform', 'Username', 'Followers', 'Kategori', 'Rate Card', 'Status', 'Tanggal Daftar'];
  const rows = adminCreators.map(c => [
    `"${c.id}"`,
    `"${c.name}"`,
    `"${c.email}"`,
    `"${c.whatsapp}"`,
    `"${c.platform}"`,
    `"${c.username}"`,
    c.followers,
    `"${c.category}"`,
    `"${c.rateCard}"`,
    `"${c.status}"`,
    `"${c.createdAt}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `CreatorHub_Creators_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV berhasil diunduh!', 'success');
}
