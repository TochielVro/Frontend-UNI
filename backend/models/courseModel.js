// models/courseModel.js
const db = require('../db');

const Course = {
  async create(data) {
    const { name, description, base_price } = data;
    const sql = `INSERT INTO courses (name, description, base_price) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [name, description, base_price || 0]);
    return { id: result.insertId };
  },

  async getAll() {
    const [courses] = await db.query('SELECT * FROM courses ORDER BY id DESC');
    return courses;
  },

  async getOne(id) {
    const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, data) {
    const { name, description, base_price } = data;
    await db.query('UPDATE courses SET name = ?, description = ?, base_price = ? WHERE id = ?', [name, description, base_price || 0, id]);
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM courses WHERE id = ?', [id]);
    return true;
  },

  // helper para obtener cursos con sus offerings y schedules
  async getCoursesWithOfferings() {
    const [courses] = await db.query('SELECT * FROM courses');
    for (const course of courses) {
      const [offerings] = await db.query('SELECT co.*, cyc.name as cycle_name, t.first_name, t.last_name FROM course_offerings co LEFT JOIN cycles cyc ON co.cycle_id = cyc.id LEFT JOIN teachers t ON co.teacher_id = t.id WHERE co.course_id = ?', [course.id]);
      course.offerings = offerings;
      for (const off of offerings) {
        const [schedules] = await db.query('SELECT * FROM schedules WHERE course_offering_id = ?', [off.id]);
        off.schedules = schedules;
      }
    }
    return courses;
  }
};

module.exports = Course;
