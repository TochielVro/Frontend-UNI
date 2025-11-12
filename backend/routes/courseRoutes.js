// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.get('/', courseController.getAll);
router.get('/:id', courseController.getOne);

// Rutas protegidas para administrador (courses CRUD)
router.post('/', verifyToken, restrictTo('admin'), courseController.create);
router.put('/:id', verifyToken, restrictTo('admin'), courseController.update);
router.delete('/:id', verifyToken, restrictTo('admin'), courseController.delete);

// Course offerings (admin)
router.post('/offerings', verifyToken, restrictTo('admin'), courseController.createOffering);
router.put('/offerings/:id', verifyToken, restrictTo('admin'), courseController.updateOffering);
router.delete('/offerings/:id', verifyToken, restrictTo('admin'), courseController.deleteOffering);

module.exports = router;
