// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const packageRoutes = require('./routes/packageRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Importar la conexión a la base de datos
require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// para servir los vouchers subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// rutas
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
