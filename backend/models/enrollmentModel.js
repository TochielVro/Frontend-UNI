// models/enrollmentModel.js
const db = require('../db');

const Enrollment = {
  // items: [{ type: 'course'|'package', id: <offering_id> }]
  async createForStudent(studentId, items) {
    const created = [];

    for (const item of items) {
      const { type, id: offering_id } = item;

      // insertar enrollment con referencia a course_offering o package_offering
      const course_offering_id = type === 'course' ? offering_id : null;
      const package_offering_id = type === 'package' ? offering_id : null;

      const [res] = await db.query(
        'INSERT INTO enrollments (student_id, course_offering_id, package_offering_id, enrollment_type, status) VALUES (?, ?, ?, ?, ?)',
        [studentId, course_offering_id, package_offering_id, type, 'pendiente']
      );

      const enrollmentId = res.insertId;

      // calcular monto según oferta (usar override si existe)
      let amount = 0;
      if (type === 'course') {
        const [rows] = await db.query(
          `SELECT COALESCE(co.price_override, c.base_price) as price
           FROM course_offerings co
           JOIN courses c ON co.course_id = c.id
           WHERE co.id = ?`,
          [offering_id]
        );
        amount = rows.length ? Number(rows[0].price) : 0;
      } else if (type === 'package') {
        const [rows] = await db.query(
          `SELECT COALESCE(po.price_override, p.base_price) as price
           FROM package_offerings po
           JOIN packages p ON po.package_id = p.id
           WHERE po.id = ?`,
          [offering_id]
        );
        amount = rows.length ? Number(rows[0].price) : 0;
      }

      // crear payment_plan y una cuota (installment) por ahora en una sola cuota
      const [pp] = await db.query(
        'INSERT INTO payment_plans (enrollment_id, total_amount, installments) VALUES (?, ?, ?)',
        [enrollmentId, amount, 1]
      );

      const paymentPlanId = pp.insertId;

      // crear una cuota única con due_date a 7 días
      const [inst] = await db.query(
        'INSERT INTO installments (payment_plan_id, installment_number, amount, due_date, status) VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?) ',
        [paymentPlanId, 1, amount, 'pending']
      );

      created.push({ enrollmentId, type, offering_id, amount, payment_plan_id: paymentPlanId, installment_id: inst.insertId });
    }

    return created;
  },

  async getByStudent(studentId) {
    // devolver información de la matrícula junto con info del item y estado del payment plan
    const [rows] = await db.query(
      `SELECT e.*,
        COALESCE(c.name, p.name) as item_name,
        COALESCE(COALESCE(co.price_override, c.base_price), COALESCE(po.price_override, p.base_price)) as item_price,
        pp.id as payment_plan_id, pp.total_amount, pp.installments as total_installments,
        COALESCE(cyc.name, cyc2.name) as cycle_name,
        COALESCE(cyc.start_date, cyc2.start_date) as cycle_start_date,
        COALESCE(cyc.end_date, cyc2.end_date) as cycle_end_date
      FROM enrollments e
      LEFT JOIN course_offerings co ON e.course_offering_id = co.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN cycles cyc ON co.cycle_id = cyc.id
      LEFT JOIN package_offerings po ON e.package_offering_id = po.id
      LEFT JOIN packages p ON po.package_id = p.id
      LEFT JOIN cycles cyc2 ON po.cycle_id = cyc2.id
      LEFT JOIN payment_plans pp ON pp.enrollment_id = e.id
      WHERE e.student_id = ?
      ORDER BY e.registered_at DESC`,
      [studentId]
    );

    // Para cada enrollment, obtener sus installments
    for (const enrollment of rows) {
      if (enrollment.payment_plan_id) {
        const [installments] = await db.query(
          'SELECT * FROM installments WHERE payment_plan_id = ? ORDER BY installment_number',
          [enrollment.payment_plan_id]
        );
        enrollment.installments = installments;
      } else {
        enrollment.installments = [];
      }
    }

    return rows;
  }
};

module.exports = Enrollment;
