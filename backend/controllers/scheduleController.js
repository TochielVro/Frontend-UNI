// controllers/scheduleController.js
const db = require('../db');

exports.create = async (req, res) => {
  try {
    const { course_offering_id, day_of_week, start_time, end_time, classroom } = req.body;

    if (!course_offering_id) {
      return res.status(400).json({ message: 'course_offering_id es requerido' });
    }

    const [result] = await db.query(
      'INSERT INTO schedules (course_offering_id, day_of_week, start_time, end_time, classroom) VALUES (?, ?, ?, ?, ?)',
      [course_offering_id, day_of_week, start_time, end_time, classroom]
    );

    res.status(201).json({
      message: 'Horario creado exitosamente',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el horario' });
  }
};

exports.getByCourseOffering = async (req, res) => {
  try {
    const [schedules] = await db.query(
      `SELECT s.*, co.id as course_offering_id, co.course_id, co.group_label, c.name as course_name, cyc.name as cycle_name
       FROM schedules s
       LEFT JOIN course_offerings co ON s.course_offering_id = co.id
       LEFT JOIN courses c ON co.course_id = c.id
       LEFT JOIN cycles cyc ON co.cycle_id = cyc.id
       WHERE s.course_offering_id = ?
       ORDER BY s.day_of_week, s.start_time`,
      [req.params.courseOfferingId]
    );
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los horarios' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { day_of_week, start_time, end_time, classroom } = req.body;
    await db.query(
      'UPDATE schedules SET day_of_week = ?, start_time = ?, end_time = ?, classroom = ? WHERE id = ?',
      [day_of_week, start_time, end_time, classroom, id]
    );
    res.json({ message: 'Horario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar horario:', err);
    res.status(500).json({ message: 'Error al actualizar horario' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ message: 'Horario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar horario:', err);
    res.status(500).json({ message: 'Error al eliminar horario' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, co.id as course_offering_id, co.course_id, co.group_label, c.name as course_name, cyc.name as cycle_name
      FROM schedules s
      LEFT JOIN course_offerings co ON s.course_offering_id = co.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN cycles cyc ON co.cycle_id = cyc.id
      ORDER BY co.course_id, s.day_of_week, s.start_time
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener todos los horarios:', err);
    res.status(500).json({ message: 'Error al obtener horarios' });
  }
};