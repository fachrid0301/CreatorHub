const jwt = require('jsonwebtoken');
const sheetsService = require('../config/googleSheets');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'creatorhub123';

const adminController = {
  /**
   * Login Admin
   */
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password admin salah!'
      });
    }

    // Buat JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login admin berhasil.',
      token,
      admin: {
        username
      }
    });
  },

  /**
   * Statistik Dashboard Admin
   */
  async getStats(req, res, next) {
    try {
      const creators = await sheetsService.getAllCreators();

      const total = creators.length;
      const pending = creators.filter(c => (c.status || '').toLowerCase() === 'pending').length;
      const approved = creators.filter(c => (c.status || '').toLowerCase() === 'approved').length;
      const rejected = creators.filter(c => (c.status || '').toLowerCase() === 'rejected').length;

      const totalReach = creators
        .filter(c => (c.status || '').toLowerCase() === 'approved')
        .reduce((sum, c) => sum + (Number(c.followers) || 0), 0);

      // Distribusi platform
      const platforms = {};
      creators.forEach(c => {
        const p = c.platform || 'Lainnya';
        platforms[p] = (platforms[p] || 0) + 1;
      });

      res.json({
        success: true,
        stats: {
          total,
          pending,
          approved,
          rejected,
          totalReach,
          platforms
        },
        connection: sheetsService.getStatus()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ambil semua data kreator (Pending, Approved, Rejected) untuk admin
   */
  async getAllCreators(req, res, next) {
    try {
      let creators = await sheetsService.getAllCreators();
      const { status, search, platform, category } = req.query;

      if (status && status !== 'All') {
        creators = creators.filter(c => (c.status || '').toLowerCase() === status.toLowerCase());
      }

      if (platform && platform !== 'All') {
        creators = creators.filter(c => (c.platform || '').toLowerCase() === platform.toLowerCase());
      }

      if (category && category !== 'All') {
        creators = creators.filter(c => (c.category || '').toLowerCase() === category.toLowerCase());
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        creators = creators.filter(c =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.username && c.username.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.whatsapp && c.whatsapp.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q))
        );
      }

      // Urutkan pendaftar terbaru di atas
      creators.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      res.json({
        success: true,
        total: creators.length,
        data: creators,
        connection: sheetsService.getStatus()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ubah status kreator (Pending, Approved, Rejected)
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }

      const updated = await sheetsService.updateCreator(id, { status });

      res.json({
        success: true,
        message: `Status kreator ${updated.name} berhasil diubah menjadi ${status}.`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Edit data kreator lengkap
   */
  async updateCreator(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Bersihkan field yang tidak boleh diubah langsung
      delete updateData.id;
      delete updateData.createdAt;

      if (updateData.followers) {
        updateData.followers = parseInt(updateData.followers, 10) || 0;
      }

      const updated = await sheetsService.updateCreator(id, updateData);

      res.json({
        success: true,
        message: `Data kreator ${updated.name} berhasil diperbarui.`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Hapus kreator dari Google Sheets
   */
  async deleteCreator(req, res, next) {
    try {
      const { id } = req.params;
      const result = await sheetsService.deleteCreator(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cek status koneksi Google Sheets
   */
  async checkConnection(req, res) {
    res.json({
      success: true,
      data: sheetsService.getStatus()
    });
  }
};

module.exports = adminController;
