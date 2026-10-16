const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

// Endpoint publik
router.get('/', creatorController.getApprovedCreators);
router.get('/stats', creatorController.getPublicStats);
router.get('/:id', creatorController.getCreatorById);
router.post('/register', creatorController.registerCreator);

module.exports = router;
