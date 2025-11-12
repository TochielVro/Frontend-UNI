// controllers/paymentController.js
const db = require('../db');
const path = require('path');

// Aprobar un installment: marcar como paid y si es la cuota final, actualizar enrollments
exports.approveInstallment = async (req, res) => {
  try {
    const { installment_id } = req.body;

    // marcar installment como paid
    await db.query('UPDATE installments SET status = ?, paid_at = NOW() WHERE id = ?', ['paid', installment_id]);

    // obtener payment_plan y enrollment
    const [rows] = await db.query(`SELECT pp.id as payment_plan_id, pp.enrollment_id FROM payment_plans pp JOIN installments i ON i.payment_plan_id = pp.id WHERE i.id = ?`, [installment_id]);
    if (!rows.length) return res.status(404).json({ message: 'Installment no encontrado' });

    const payment_plan_id = rows[0].payment_plan_id;
    const enrollment_id = rows[0].enrollment_id;

    // Si todas las cuotas están pagadas, actualizar enrollment a 'aceptado'
    const [pending] = await db.query('SELECT COUNT(*) as cnt FROM installments WHERE payment_plan_id = ? AND status != ?', [payment_plan_id, 'paid']);
    if (pending[0].cnt === 0) {
      await db.query('UPDATE enrollments SET status = ?, accepted_at = NOW() WHERE id = ?', ['aceptado', enrollment_id]);
    }

    // notificar padre (intentar)
    const [srows] = await db.query(`SELECT s.* FROM enrollments e JOIN students s ON e.student_id = s.id WHERE e.id = ?`, [enrollment_id]);
    if (srows.length) {
      const student = srows[0];
      const { sendNotificationToParent } = require('../utils/notifications');
      try { 
        await sendNotificationToParent(
          student.id,
          student.parent_phone, 
          `Pago recibido para la matrícula ${enrollment_id}`, 
          'other'
        ); 
      } catch (err) { 
        console.error('Notif err', err); 
      }
    }

    res.json({ message: 'Installment aprobado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al aprobar installment' });
  }
};

// Subir voucher a un installment
exports.uploadVoucher = async (req, res) => {
  try {
    const file = req.file;
    const { installment_id } = req.body;

    if (!file) return res.status(400).json({ message: 'No se subió ningún archivo' });

    // Verificar existencia del installment y permiso
    const [instRows] = await db.query('SELECT i.*, pp.enrollment_id, e.student_id FROM installments i JOIN payment_plans pp ON i.payment_plan_id = pp.id JOIN enrollments e ON pp.enrollment_id = e.id WHERE i.id = ?', [installment_id]);
    if (!instRows.length) return res.status(404).json({ message: 'Installment no encontrado' });
    const installment = instRows[0];
    if (req.user.role !== 'admin' && req.user.id !== installment.student_id) return res.status(403).json({ message: 'No tienes permiso' });

    const voucherUrl = `/uploads/${file.filename}`;

    await db.query('UPDATE installments SET voucher_url = ?, status = ? WHERE id = ?', [voucherUrl, 'pending', installment_id]);

    res.json({ message: 'Voucher subido con éxito', voucherUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al subir voucher' });
  }
};

// Obtener installments (filtro opcional por status)
exports.getAll = async (req, res) => {
  try {
    const status = req.query.status; // pending, paid, overdue
    let sql = `SELECT i.*, pp.enrollment_id, e.student_id, s.first_name, s.last_name, s.dni,
      COALESCE(c.name, p.name) as item_name, e.enrollment_type
      FROM installments i
      JOIN payment_plans pp ON i.payment_plan_id = pp.id
      JOIN enrollments e ON pp.enrollment_id = e.id
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN course_offerings co ON e.course_offering_id = co.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN package_offerings po ON e.package_offering_id = po.id
      LEFT JOIN packages p ON po.package_id = p.id`;

    const params = [];
    if (status) {
      sql += ' WHERE i.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY i.id DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener installments:', err);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};
