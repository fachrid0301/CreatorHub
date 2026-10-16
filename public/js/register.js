/**
 * CreatorHub - Creator Registration Form Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  setupLivePreview();
  setupFormSubmission();
});

// Real-time synchronization ke Preview Card di sebelah kanan
function setupLivePreview() {
  const nameInput = document.getElementById('regName');
  const platformInputs = document.querySelectorAll('input[name="platform"]');
  const usernameInput = document.getElementById('regUsername');
  const followersInput = document.getElementById('regFollowers');
  const categoryInput = document.getElementById('regCategory');
  const avatarInput = document.getElementById('regAvatar');
  const bioInput = document.getElementById('regBio');
  const rateInput = document.getElementById('regRateCard');

  // Preview elements
  const prevName = document.getElementById('prevName');
  const prevHandle = document.getElementById('prevHandle');
  const prevCategory = document.getElementById('prevCategory');
  const prevPlatformBadge = document.getElementById('prevPlatformBadge');
  const prevFollowers = document.getElementById('prevFollowers');
  const prevRate = document.getElementById('prevRate');
  const prevBio = document.getElementById('prevBio');
  const prevAvatar = document.getElementById('prevAvatar');

  if (nameInput && prevName) {
    nameInput.addEventListener('input', (e) => {
      prevName.textContent = e.target.value.trim() || 'Nama Kreator Anda';
    });
  }

  if (usernameInput && prevHandle) {
    usernameInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val && !val.startsWith('@')) val = '@' + val;
      prevHandle.textContent = val || '@username_anda';
    });
  }

  if (categoryInput && prevCategory) {
    categoryInput.addEventListener('change', (e) => {
      prevCategory.textContent = e.target.value || 'Kategori Konten';
    });
  }

  if (followersInput && prevFollowers) {
    followersInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      prevFollowers.textContent = isNaN(val) ? '0' : formatFollowers(val);
    });
  }

  if (rateInput && prevRate) {
    rateInput.addEventListener('input', (e) => {
      prevRate.textContent = e.target.value.trim() || 'Mulai dari Rp -';
    });
  }

  if (bioInput && prevBio) {
    bioInput.addEventListener('input', (e) => {
      prevBio.textContent = e.target.value.trim() || 'Ceritakan keunikan gaya konten, audiens, dan pencapaian Anda di sini...';
    });
  }

  if (avatarInput && prevAvatar) {
    avatarInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        prevAvatar.src = val;
      } else {
        prevAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
      }
    });
  }

  platformInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (prevPlatformBadge) {
        prevPlatformBadge.innerHTML = getPlatformBadge(e.target.value);
      }
    });
  });
}

// Form Submission
function setupFormSubmission() {
  const form = document.getElementById('creatorRegisterForm');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const platformEl = document.querySelector('input[name="platform"]:checked');
    const platform = platformEl ? platformEl.value : 'Instagram';
    const username = document.getElementById('regUsername').value.trim();
    const followers = document.getElementById('regFollowers').value.trim();
    const category = document.getElementById('regCategory').value;
    const portfolio = document.getElementById('regPortfolio').value.trim();
    const avatar = document.getElementById('regAvatar').value.trim();
    const rateCard = document.getElementById('regRateCard').value.trim();
    const bio = document.getElementById('regBio').value.trim();

    // Validasi
    if (!name) {
      showToast('Nama lengkap wajib diisi!', 'warning');
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('Masukkan alamat email yang valid!', 'warning');
      return;
    }
    if (!whatsapp) {
      showToast('Nomor WhatsApp wajib diisi untuk konfirmasi!', 'warning');
      return;
    }
    if (!username) {
      showToast('Username media sosial wajib diisi!', 'warning');
      return;
    }
    if (!followers || isNaN(Number(followers))) {
      showToast('Jumlah followers harus berupa angka!', 'warning');
      return;
    }
    if (!category) {
      showToast('Pilih salah satu kategori konten!', 'warning');
      return;
    }

    const payload = {
      name,
      email,
      whatsapp,
      platform,
      username,
      followers: parseInt(followers, 10),
      category,
      portfolio,
      avatar,
      rateCard,
      bio
    };

    // Tombol loading
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span style="display:inline-block; width:16px; height:16px; border:2px solid #FFF; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
      Menyimpan ke Google Sheets...
    `;

    try {
      const response = await fetch('/api/creators/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessModal(result.data);
        form.reset();
        // Reset live preview
        document.getElementById('prevName').textContent = 'Nama Kreator Anda';
        document.getElementById('prevHandle').textContent = '@username_anda';
        document.getElementById('prevFollowers').textContent = '0';
        document.getElementById('prevBio').textContent = 'Ceritakan keunikan gaya konten, audiens, dan pencapaian Anda di sini...';
        showToast('Pendaftaran Anda berhasil dikirim!', 'success');
      } else {
        throw new Error(result.message || 'Gagal mengirim pendaftaran');
      }
    } catch (err) {
      console.error('Error pendaftaran:', err);
      showToast(err.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

function showSuccessModal(creator) {
  let modal = document.getElementById('regSuccessModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'regSuccessModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-container" style="max-width: 520px; text-align: center; padding: 36px 28px;">
      <div style="width: 72px; height: 72px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg width="40" height="40" fill="none" stroke="#10B981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
      </div>

      <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Pendaftaran Berhasil Dikirim!</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 24px; font-size: 0.95rem;">
        Terima kasih, <strong>${creator.name}</strong>. Profil Anda telah tersimpan otomatis ke database Google Sheets kami.
      </p>

      <div style="background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px; text-align: left; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">ID Registrasi:</span>
          <strong style="font-size: 0.85rem; font-family: monospace;">${creator.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">Platform:</span>
          <strong style="font-size: 0.85rem;">${creator.platform} (${creator.username})</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">Status Saat Ini:</span>
          <span class="badge badge-pending">Menunggu Verifikasi (Pending)</span>
        </div>
      </div>

      <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 24px;">
        Tim kurator CreatorHub akan meninjau akun Anda dalam 1x24 jam kerja. Setelah disetujui, profil Anda akan langsung tayang di katalog Explore Creators.
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <a href="creators.html" class="btn btn-secondary">Lihat Kreator Lain</a>
        <button class="btn btn-primary" onclick="closeSuccessModal()">Selesai</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSuccessModal();
  });
}

function closeSuccessModal() {
  const modal = document.getElementById('regSuccessModal');
  if (modal) modal.classList.remove('active');
}
