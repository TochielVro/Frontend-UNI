// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);
router.get('/notifications', adminController.getNotifications);

module.exports = router;

