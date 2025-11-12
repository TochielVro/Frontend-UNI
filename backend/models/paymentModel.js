// models/paymentModel.js
const db = require('../db');

const Payment = {
  async createPaymentPlan(enrollmentId, totalAmount, installments) {
    const [result] = await db.query(
      'INSERT INTO payment_plans (enrollment_id, total_amount, installments) VALUES (?, ?, ?)',
      [enrollmentId, totalAmount, installments]
    );
    return result.insertId;
  },

  async createInstallment(paymentPlanId, installmentNumber, amount, dueDate) {
    const [result] = await db.query(
      'INSERT INTO installments (payment_plan_id, installment_number, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [paymentPlanId, installmentNumber, amount, dueDate, 'pending']
    );
    return result.insertId;
  },

  async getPaymentPlanByEnrollment(enrollmentId) {
    const [rows] = await db.query(
      'SELECT * FROM payment_plans WHERE enrollment_id = ?',
      [enrollmentId]
    );
    return rows[0];
  },

  async getInstallmentsByPaymentPlan(paymentPlanId) {
    const [rows] = await db.query(
      'SELECT * FROM installments WHERE payment_plan_id = ? ORDER BY installment_number',
      [paymentPlanId]
    );
    return rows;
  },

  async updateInstallmentStatus(installmentId, status, voucherUrl = null) {
    const updates = ['status = ?'];
    const params = [status];

    if (voucherUrl) {
      updates.push('voucher_url = ?');
      params.push(voucherUrl);
    }

    if (status === 'paid') {
      updates.push('paid_at = NOW()');
    }

    params.push(installmentId);

    await db.query(
      `UPDATE installments SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return true;
  },

  async getOverdueInstallments() {
    const [rows] = await db.query(
      `SELECT i.*, pp.enrollment_id, e.student_id, s.first_name, s.last_name, s.parent_phone
       FROM installments i
       JOIN payment_plans pp ON i.payment_plan_id = pp.id
       JOIN enrollments e ON pp.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       WHERE i.status = 'pending' AND i.due_date < CURDATE()
       ORDER BY i.due_date ASC`
    );
    return rows;
  },

  async getTotalPaidByEnrollment(enrollmentId) {
    const [rows] = await db.query(
      `SELECT SUM(amount) as total_paid
       FROM installments i
       JOIN payment_plans pp ON i.payment_plan_id = pp.id
       WHERE pp.enrollment_id = ? AND i.status = 'paid'`,
      [enrollmentId]
    );
    return rows[0]?.total_paid || 0;
  }
};

module.exports = Payment;

