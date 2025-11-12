// controllers/studentController.js
const Student = require('../models/studentModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { dni, first_name, last_name, phone, parent_name, parent_phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await Student.getByDni(dni);
    if (existing) return res.status(400).json({ message: 'El DNI ya está registrado' });

    await Student.create({ dni, first_name, last_name, phone, parent_name, parent_phone, password_hash: hashedPassword });
    res.status(201).json({ message: 'Alumno registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar alumno' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener alumnos' });
  }
};
