const sheetsService = require('../config/googleSheets');

/**
 * Controller publik untuk katalog kreator dan pendaftaran
 */
const creatorController = {
  /**
   * Mengambil daftar kreator yang sudah berstatus 'Approved' untuk publik
   */
  async getApprovedCreators(req, res, next) {
    try {
      const all = await sheetsService.getAllCreators();
      // Publik hanya melihat kreator yang disetujui (Approved)
      let list = all.filter(c => (c.status || '').toLowerCase() === 'approved');

      const { category, platform, tier, search, sort } = req.query;

      // Filter Kategori
      if (category && category !== 'All') {
        list = list.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
      }

      // Filter Platform
      if (platform && platform !== 'All') {
        list = list.filter(c => c.platform && c.platform.toLowerCase() === platform.toLowerCase());
      }

      // Filter Follower Tier
      if (tier && tier !== 'All') {
        list = list.filter(c => {
          const f = Number(c.followers) || 0;
          switch (tier) {
            case 'nano': return f < 10000;
            case 'micro': return f >= 10000 && f < 100000;
            case 'macro': return f >= 100000 && f < 500000;
            case 'mega': return f >= 500000;
            default: return true;
          }
        });
      }

      // Search (nama, username, bio, category)
      if (search && search.trim() !== '') {
        const query = search.trim().toLowerCase();
        list = list.filter(c => 
          (c.name && c.name.toLowerCase().includes(query)) ||
          (c.username && c.username.toLowerCase().includes(query)) ||
          (c.bio && c.bio.toLowerCase().includes(query)) ||
          (c.category && c.category.toLowerCase().includes(query))
        );
      }

      // Sorting
      if (sort === 'followers-asc') {
        list.sort((a, b) => (Number(a.followers) || 0) - (Number(b.followers) || 0));
      } else if (sort === 'name-asc') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sort === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        // Default: followers-desc (terbanyak di atas)
        list.sort((a, b) => (Number(b.followers) || 0) - (Number(a.followers) || 0));
      }

      // Dapatkan daftar kategori unik untuk filter
      const categories = [...new Set(all.map(c => c.category).filter(Boolean))];
      const platforms = [...new Set(all.map(c => c.platform).filter(Boolean))];

      res.json({
        success: true,
        total: list.length,
        categories,
        platforms,
        data: list,
        storageMode: sheetsService.getStatus().mode
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Detail satu kreator
   */
  async getCreatorById(req, res, next) {
    try {
      const { id } = req.params;
      const all = await sheetsService.getAllCreators();
      const creator = all.find(c => c.id === id && (c.status || '').toLowerCase() === 'approved');

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Kreator tidak ditemukan atau belum disetujui.'
        });
      }

      res.json({
        success: true,
        data: creator
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Pendaftaran kreator baru
   */
  async registerCreator(req, res, next) {
    try {
      const {
        name,
        email,
        whatsapp,
        platform,
        username,
        followers,
        category,
        portfolio,
        avatar,
        bio,
        rateCard
      } = req.body;

      // Validasi sederhana
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Format alamat email tidak valid.' });
      }

      if (!whatsapp || !whatsapp.trim()) {
        return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi.' });
      }

      if (!platform) {
        return res.status(400).json({ success: false, message: 'Platform media sosial wajib dipilih.' });
      }

      if (!username || !username.trim()) {
        return res.status(400).json({ success: false, message: 'Username media sosial wajib diisi.' });
      }

      const followersNum = parseInt(followers, 10);
      if (isNaN(followersNum) || followersNum < 0) {
        return res.status(400).json({ success: false, message: 'Jumlah followers harus berupa angka yang valid.' });
      }

      if (!category) {
        return res.status(400).json({ success: false, message: 'Kategori konten wajib dipilih.' });
      }

      // Simpan ke Google Sheets (status otomatis Pending)
      const created = await sheetsService.addCreator({
        name,
        email,
        whatsapp,
        platform,
        username,
        followers: followersNum,
        category,
        portfolio,
        avatar,
        bio,
        rateCard
      });

      res.status(201).json({
        success: true,
        message: 'Pendaftaran berhasil dikirim! Tim CreatorHub akan memverifikasi profil Anda dalam 1x24 jam kerja.',
        data: created
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Status platform & statistik landing page
   */
  async getPublicStats(req, res, next) {
    try {
      const all = await sheetsService.getAllCreators();
      const approved = all.filter(c => (c.status || '').toLowerCase() === 'approved');

      const totalFollowers = approved.reduce((acc, curr) => acc + (Number(curr.followers) || 0), 0);
      const categories = [...new Set(approved.map(c => c.category).filter(Boolean))];

      res.json({
        success: true,
        stats: {
          totalCreators: approved.length,
          totalReach: totalFollowers,
          totalCategories: categories.length || 8,
          activeBrands: 150 // metric ilustratif
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = creatorController;
