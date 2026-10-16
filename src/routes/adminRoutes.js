const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Endpoint login admin (tanpa token)
router.post('/login', adminController.login);

// Endpoint terproteksi admin (wajib token)
router.get('/stats', verifyAdminToken, adminController.getStats);
router.get('/creators', verifyAdminToken, adminController.getAllCreators);
router.put('/creators/:id/status', verifyAdminToken, adminController.updateStatus);
router.put('/creators/:id', verifyAdminToken, adminController.updateCreator);
router.delete('/creators/:id', verifyAdminToken, adminController.deleteCreator);
router.get('/connection', verifyAdminToken, adminController.checkConnection);

module.exports = router;
