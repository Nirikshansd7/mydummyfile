const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

router.post('/update-profile', authenticateToken, userController.updateUserProfile);
router.get('/get', authenticateToken, userController.getUser);
router.post('/logout', authenticateToken, userController.logout);

module.exports = router;
