// routes/cycleRoutes.js
const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycleController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', cycleController.getAll);
router.get('/active', cycleController.getActive);
router.get('/:id', cycleController.getOne);

// Rutas protegidas para administrador
router.post('/', verifyToken, restrictTo('admin'), cycleController.create);
router.put('/:id', verifyToken, restrictTo('admin'), cycleController.update);
router.delete('/:id', verifyToken, restrictTo('admin'), cycleController.delete);

module.exports = router;

