// models/userModel.js
const db = require('../db');
const bcrypt = require('bcrypt');

const User = {
  async create({ username, password, role, related_id }) {
    const password_hash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (username, password_hash, role, related_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [username, password_hash, role, related_id || null]);
    return result.insertId;
  },

  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  async verifyPassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
  }
};

module.exports = User;
