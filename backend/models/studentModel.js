// models/studentModel.js
const db = require('../db');

const Student = {
  async create(data) {
    const { dni, first_name, last_name, phone, parent_name, parent_phone, password_hash } = data;
    const sql = `
      INSERT INTO students (dni, first_name, last_name, phone, parent_name, parent_phone, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [dni, first_name, last_name, phone, parent_name, parent_phone, password_hash]);
    return result;
  },

  async getAll() {
    const [rows] = await db.query('SELECT * FROM students');
    return rows;
  },

  async getByDni(dni) {
    const [rows] = await db.query('SELECT * FROM students WHERE dni = ?', [dni]);
    return rows[0];
  }
};

module.exports = Student;
