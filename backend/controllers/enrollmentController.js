// controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const db = require('../db');

// Obtener las matrículas del estudiante autenticado
exports.getAll = async (req, res) => {
  try {
    let studentId;
    
    // Si es estudiante, usar su ID del token
    if (req.user.role === 'student') {
      studentId = req.user.id;
    } 
    // Si es admin, puede especificar student_id en query
    else if (req.user.role === 'admin' && req.query.student_id) {
      studentId = req.query.student_id;
    } 
    else {
      return res.status(400).json({ message: 'Falta student_id o no tienes permisos' });
    }

    const enrollments = await Enrollment.getByStudent(studentId);
    res.json(enrollments);
  } catch (err) {
    console.error('Error al obtener las matrículas:', err);
    res.status(500).json({ message: 'Error al obtener las matrículas' });
  }
};

// Crear matrículas para el estudiante autenticado a partir de una lista de items
// body: { items: [{ type: 'course'|'package', id: <offering_id> }] }
exports.create = async (req, res) => {
  try {
    const studentId = req.user && req.user.id;
    if (!studentId) return res.status(401).json({ message: 'No autenticado' });

    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No se enviaron items para matricular' });
    }

    const created = await Enrollment.createForStudent(studentId, items);
    res.status(201).json({ message: 'Matrículas creadas correctamente', created });
  } catch (err) {
    console.error('Error al crear matrículas:', err);
    res.status(500).json({ message: 'Error al crear la matrícula' });
  }
};

// Obtener todas las matrículas (solo admin) con info de estudiante y pago
exports.getAllAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, s.first_name, s.last_name, s.dni,
        COALESCE(c.name, p.name) as item_name,
        pp.id as payment_plan_id, ip.id as installment_id, ip.amount as installment_amount, ip.status as installment_status, ip.voucher_url
      FROM enrollments e
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN course_offerings co ON e.course_offering_id = co.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN package_offerings po ON e.package_offering_id = po.id
      LEFT JOIN packages p ON po.package_id = p.id
      LEFT JOIN payment_plans pp ON pp.enrollment_id = e.id
      LEFT JOIN installments ip ON ip.payment_plan_id = pp.id AND ip.installment_number = 1
      ORDER BY e.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo matrículas admin:', err);
    res.status(500).json({ message: 'Error al obtener matrículas' });
  }
};

// Aceptar o rechazar matrícula (solo admin)
exports.updateStatus = async (req, res) => {
  try {
    const { enrollment_id, status } = req.body;
    
    if (!['aceptado', 'rechazado', 'cancelado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const adminId = req.user.id;
    const accepted_at = status === 'aceptado' ? new Date() : null;

    await db.query(
      'UPDATE enrollments SET status = ?, accepted_by_admin_id = ?, accepted_at = ? WHERE id = ?',
      [status, adminId, accepted_at, enrollment_id]
    );

    res.json({ message: `Matrícula ${status} correctamente` });
  } catch (err) {
    console.error('Error actualizando estado de matrícula:', err);
    res.status(500).json({ message: 'Error al actualizar estado de matrícula' });
  }
};