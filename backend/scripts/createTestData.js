// scripts/createTestData.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createTestData() {
  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'TochielVroXd12',
      database: process.env.DB_NAME || 'academia'
    });

    // Insertar profesores de prueba
    const teachers = [
      {
        dni: '12345678',
        name: 'Juan Pérez',
        phone: '987654321',
        email: 'juan.perez@example.com',
        bio: 'Profesor de Matemáticas con 10 años de experiencia'
      },
      {
        dni: '87654321',
        name: 'María García',
        phone: '987654322',
        email: 'maria.garcia@example.com',
        bio: 'Profesora de Física con doctorado en Física Cuántica'
      },
      {
        dni: '23456789',
        name: 'Carlos López',
        phone: '987654323',
        email: 'carlos.lopez@example.com',
        bio: 'Profesor de Química con experiencia en investigación'
      }
    ];

    for (const teacher of teachers) {
      // Insertar profesor
      const [result] = await connection.execute(
        'INSERT INTO teachers (name, phone, email, bio) VALUES (?, ?, ?, ?)',
        [teacher.name, teacher.phone, teacher.email, teacher.bio]
      );

      // Crear cuenta de usuario para el profesor
      const hashedPassword = await bcrypt.hash('profesor123', 10);
      await connection.execute(
        'INSERT INTO users (username, password_hash, role, related_id) VALUES (?, ?, ?, ?)',
        [teacher.dni, hashedPassword, 'teacher', result.insertId]
      );

      console.log(`Profesor creado: ${teacher.name}`);
      console.log(`DNI (usuario): ${teacher.dni}`);
      console.log(`Contraseña: profesor123`);
      console.log('-------------------');
    }

    // También actualizamos el usuario admin con un DNI
    await connection.execute(
      'UPDATE users SET username = ? WHERE username = ?',
      ['99999999', 'admin']
    );

    console.log('Usuario admin actualizado:');
    console.log('DNI (usuario): 99999999');
    console.log('Contraseña: admin123');

    await connection.end();
    console.log('Datos de prueba creados exitosamente');

  } catch (err) {
    console.error('Error al crear datos de prueba:', err);
  }
}

createTestData();