// models/packageOfferingModel.js
const db = require('../db');

const PackageOffering = {
  async create(data) {
    const { package_id, cycle_id, group_label, price_override, capacity } = data;
    const [result] = await db.query(
      `INSERT INTO package_offerings (package_id, cycle_id, group_label, price_override, capacity) VALUES (?, ?, ?, ?, ?)`,
      [package_id, cycle_id, group_label || null, price_override || null, capacity || null]
    );
    return { id: result.insertId };
  },

  async getByPackage(packageId) {
    const [rows] = await db.query('SELECT po.*, pkg.name as package_name, cyc.name as cycle_name FROM package_offerings po JOIN packages pkg ON po.package_id = pkg.id LEFT JOIN cycles cyc ON po.cycle_id = cyc.id WHERE po.package_id = ?', [packageId]);
    return rows;
  },

  async getAll() {
    const [rows] = await db.query('SELECT po.*, pkg.name as package_name, cyc.name as cycle_name FROM package_offerings po JOIN packages pkg ON po.package_id = pkg.id LEFT JOIN cycles cyc ON po.cycle_id = cyc.id ORDER BY po.id DESC');
    return rows;
  },

  async update(id, data) {
    const { group_label, price_override, capacity, cycle_id } = data;
    await db.query('UPDATE package_offerings SET group_label = ?, price_override = ?, capacity = ?, cycle_id = ? WHERE id = ?', [group_label || null, price_override || null, capacity || null, cycle_id || null, id]);
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM package_offerings WHERE id = ?', [id]);
    return true;
  }
};

module.exports = PackageOffering;
