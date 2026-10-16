const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'creatorhub-super-secret-jwt-key-2026';

function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi admin tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Sesi login admin telah kedaluwarsa atau tidak valid. Silakan login kembali.'
    });
  }
}

module.exports = {
  verifyAdminToken,
  JWT_SECRET
};
