// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Ruta pública para registro de estudiantes
router.post('/register', studentController.register);

// Ruta protegida solo para administradores
router.get('/', verifyToken, restrictTo('admin'), studentController.getAll);

module.exports = router;
