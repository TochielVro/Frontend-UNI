// utils/notifications.js
const db = require('../db');

exports.sendNotificationToParent = async (studentId, phone, message, type = 'other') => {
  try {
    // Aquí iría la lógica para enviar SMS o WhatsApp
    // Por ahora solo lo registramos en la base de datos
    if (!studentId) {
      console.error('studentId es requerido para enviar notificación');
      return false;
    }

    await db.query(
      'INSERT INTO notifications_log (student_id, parent_phone, type, message, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, phone, type, message, 'pending']
    );
    
    // En producción, aquí se enviaría el SMS/WhatsApp real
    // Por ahora marcamos como enviado después de registrarlo
    // await db.query('UPDATE notifications_log SET status = ? WHERE id = ?', ['sent', result.insertId]);
    
    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
};