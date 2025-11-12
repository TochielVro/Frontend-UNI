// tests/flujo-test.js
// Script de pruebas para verificar el flujo completo del sistema
const axios = require('axios');
const BASE_URL = 'http://localhost:4000/api';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = '';
let studentToken = '';
let teacherToken = '';
let cycleId = null;
let courseId = null;
let teacherId = null;
let courseOfferingId = null;
let studentId = null;
let enrollmentId = null;
let paymentPlanId = null;
let installmentId = null;
let scheduleId = null;

// Helper para imprimir resultados
function log(message, type = 'info') {
  const prefix = type === 'success' ? `${colors.green}✓` : 
                 type === 'error' ? `${colors.red}✗` : 
                 type === 'warning' ? `${colors.yellow}⚠` : 
                 `${colors.cyan}ℹ`;
  console.log(`${prefix} ${message}${colors.reset}`);
}

// Helper para hacer peticiones
async function request(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Helper para subir archivo
async function uploadFile(url, filePath, token, formData) {
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('voucher', fs.createReadStream(filePath));
    form.append('installment_id', formData.installment_id);

    const response = await axios.post(`${BASE_URL}${url}`, form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message
    };
  }
}

// ============================================
// PASO 0: Verificar que el servidor esté funcionando
// ============================================
async function paso0_VerificarServidor() {
  log('\n=== PASO 0: Verificar que el servidor esté funcionando ===', 'info');
  
  try {
    const result = await request('GET', '/cycles');
    if (result.success || result.status === 401 || result.status === 403) {
      log('Servidor está funcionando', 'success');
      return true;
    } else {
      log('Servidor no responde correctamente', 'error');
      return false;
    }
  } catch (error) {
    log(`Error conectando al servidor: ${error.message}`, 'error');
    log('Asegúrate de que el servidor esté corriendo en http://localhost:4000', 'warning');
    return false;
  }
}

// ============================================
// PASO 1: Admin crea ciclo
// ============================================
async function paso1_CrearCiclo() {
  log('\n=== PASO 1: Admin crea ciclo ===', 'info');
  
  // Primero necesitamos crear un admin o hacer login
  const loginResult = await request('POST', '/auth/login', {
    dni: 'admin',
    password: 'admin123'
  });

  if (!loginResult.success) {
    // Intentar crear admin mediante el endpoint de registro
    log('Admin no encontrado, intentando crear...', 'warning');
    const registerResult = await request('POST', '/auth/register', {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    if (registerResult.success) {
      log('Admin creado exitosamente', 'success');
      // Intentar login de nuevo
      const loginResult2 = await request('POST', '/auth/login', {
        dni: 'admin',
        password: 'admin123'
      });
      
      if (loginResult2.success) {
        adminToken = loginResult2.data.token;
        log('Admin autenticado', 'success');
      } else {
        log(`Error en login después de crear admin: ${JSON.stringify(loginResult2.error)}`, 'error');
        return false;
      }
    } else {
      log(`Error creando admin: ${JSON.stringify(registerResult.error)}`, 'error');
      log('Puedes crear un admin ejecutando: node scripts/createAdmin.js', 'warning');
      return false;
    }
  } else {
    adminToken = loginResult.data.token;
    log('Admin autenticado', 'success');
  }

  // Crear ciclo
  const cicloData = {
    name: 'Ciclo 2024-1',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    duration_months: 6,
    status: 'open'
  };

  const result = await request('POST', '/cycles', cicloData, adminToken);
  
  if (result.success) {
    cycleId = result.data.id;
    log(`Ciclo creado: ${cycleId}`, 'success');
    return true;
  } else {
    log(`Error creando ciclo: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 2: Admin agrega cursos y docentes
// ============================================
async function paso2_AgregarCursosYDocentes() {
  log('\n=== PASO 2: Admin agrega cursos y docentes ===', 'info');

  // Crear curso con nombre único
  const timestamp = Date.now();
  const cursoData = {
    name: `Matemáticas Básicas ${timestamp}`,
    description: 'Curso de matemáticas para principiantes',
    base_price: 500.00
  };

  const cursoResult = await request('POST', '/courses', cursoData, adminToken);
  
  if (cursoResult.success) {
    courseId = cursoResult.data.id;
    log(`Curso creado: ${courseId}`, 'success');
  } else {
    log(`Error creando curso: ${JSON.stringify(cursoResult.error)}`, 'error');
    return false;
  }

  // Crear docente con DNI único
  const teacherData = {
    first_name: 'Juan',
    last_name: 'Pérez',
    dni: `12345${timestamp.toString().slice(-6)}`, // Últimos 6 dígitos del timestamp
    phone: `987654321`,
    email: `juan.perez.${timestamp}@academia.com`,
    specialization: 'Matemáticas'
  };

  const teacherResult = await request('POST', '/teachers', teacherData, adminToken);
  
  if (teacherResult.success) {
    teacherId = teacherResult.data.id;
    log(`Docente creado: ${teacherId}`, 'success');
  } else {
    // Si el docente ya existe, intentar obtenerlo
    if (teacherResult.error.message && teacherResult.error.message.includes('ya está')) {
      log('Docente ya existe, buscando docente existente...', 'warning');
      const teachersResult = await request('GET', '/teachers', null, adminToken);
      if (teachersResult.success && teachersResult.data.length > 0) {
        teacherId = teachersResult.data[0].id;
        log(`Usando docente existente: ${teacherId}`, 'success');
      } else {
        log(`Error obteniendo docente: ${JSON.stringify(teacherResult.error)}`, 'error');
        return false;
      }
    } else {
      log(`Error creando docente: ${JSON.stringify(teacherResult.error)}`, 'error');
      return false;
    }
  }

  return true;
}

// ============================================
// PASO 3: Admin publica ofertas
// ============================================
async function paso3_PublicarOfertas() {
  log('\n=== PASO 3: Admin publica ofertas ===', 'info');

  const offeringData = {
    course_id: courseId,
    cycle_id: cycleId,
    group_label: 'Grupo A',
    teacher_id: teacherId,
    price_override: 450.00,
    capacity: 30
  };

  const result = await request('POST', '/courses/offerings', offeringData, adminToken);
  
  if (result.success) {
    courseOfferingId = result.data.id;
    log(`Oferta de curso creada: ${courseOfferingId}`, 'success');
    return true;
  } else {
    log(`Error creando oferta: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 4: Admin define horarios
// ============================================
async function paso4_DefinirHorarios() {
  log('\n=== PASO 4: Admin define horarios ===', 'info');

  const scheduleData = {
    course_offering_id: courseOfferingId,
    day_of_week: 'Lunes',
    start_time: '09:00:00',
    end_time: '11:00:00',
    classroom: 'Aula 101'
  };

  const result = await request('POST', '/schedules', scheduleData, adminToken);
  
  if (result.success) {
    scheduleId = result.data.id;
    log(`Horario creado: ${scheduleId}`, 'success');
    return true;
  } else {
    log(`Error creando horario: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 5: Alumno se registra
// ============================================
async function paso5_AlumnoSeRegistra() {
  log('\n=== PASO 5: Alumno se registra ===', 'info');

  const timestamp = Date.now();
  const studentData = {
    dni: `87654${timestamp.toString().slice(-6)}`, // Últimos 6 dígitos del timestamp
    first_name: 'María',
    last_name: 'García',
    phone: '987654322',
    parent_name: 'Pedro García',
    parent_phone: '987654323',
    password: 'student123'
  };

  const result = await request('POST', '/students/register', studentData);
  
  if (result.success) {
    log('Estudiante registrado', 'success');
    
    // Hacer login del estudiante
    const loginResult = await request('POST', '/auth/login', {
      dni: studentData.dni,
      password: studentData.password
    });
    
    if (loginResult.success) {
      studentToken = loginResult.data.token;
      studentId = loginResult.data.user.id;
      log(`Estudiante autenticado: ${studentId}`, 'success');
      return true;
    } else {
      log(`Error en login de estudiante: ${JSON.stringify(loginResult.error)}`, 'error');
      return false;
    }
  } else {
    // Si el estudiante ya existe, intentar hacer login
    if (result.error.message && result.error.message.includes('ya está')) {
      log('Estudiante ya existe, intentando login...', 'warning');
      const loginResult = await request('POST', '/auth/login', {
        dni: studentData.dni,
        password: studentData.password
      });
      
      if (loginResult.success) {
        studentToken = loginResult.data.token;
        studentId = loginResult.data.user.id;
        log(`Estudiante autenticado: ${studentId}`, 'success');
        return true;
      } else {
        log(`Error en login de estudiante: ${JSON.stringify(loginResult.error)}`, 'error');
        return false;
      }
    } else {
      log(`Error registrando estudiante: ${JSON.stringify(result.error)}`, 'error');
      return false;
    }
  }
}

// ============================================
// PASO 6: Alumno elige curso y se matricula
// ============================================
async function paso6_AlumnoSeMatricula() {
  log('\n=== PASO 6: Alumno elige curso y se matricula ===', 'info');

  const enrollmentData = {
    items: [
      {
        type: 'course',
        id: courseOfferingId
      }
    ]
  };

  const result = await request('POST', '/enrollments', enrollmentData, studentToken);
  
  if (result.success) {
    enrollmentId = result.data.created[0].enrollmentId;
    paymentPlanId = result.data.created[0].payment_plan_id;
    installmentId = result.data.created[0].installment_id;
    log(`Matrícula creada: ${enrollmentId}`, 'success');
    log(`Plan de pago creado: ${paymentPlanId}`, 'success');
    log(`Cuota creada: ${installmentId}`, 'success');
    return true;
  } else {
    log(`Error creando matrícula: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 7: Admin revisa matrículas
// ============================================
async function paso7_AdminRevisaMatriculas() {
  log('\n=== PASO 7: Admin revisa matrículas ===', 'info');

  const result = await request('GET', '/enrollments/admin', null, adminToken);
  
  if (result.success) {
    const enrollments = result.data;
    const pendingEnrollment = enrollments.find(e => e.status === 'pendiente');
    
    if (pendingEnrollment) {
      log(`Matrícula pendiente encontrada: ${pendingEnrollment.id}`, 'success');
      enrollmentId = pendingEnrollment.id;
      return true;
    } else {
      log('No se encontraron matrículas pendientes', 'warning');
      return false;
    }
  } else {
    log(`Error obteniendo matrículas: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 8: Admin acepta matrícula
// ============================================
async function paso8_AdminAceptaMatricula() {
  log('\n=== PASO 8: Admin acepta matrícula ===', 'info');

  const result = await request('PUT', '/enrollments/status', {
    enrollment_id: enrollmentId,
    status: 'aceptado'
  }, adminToken);
  
  if (result.success) {
    log(`Matrícula aceptada: ${enrollmentId}`, 'success');
    return true;
  } else {
    log(`Error aceptando matrícula: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 9: Docente marca asistencias
// ============================================
async function paso9_DocenteMarcaAsistencias() {
  log('\n=== PASO 9: Docente marca asistencias ===', 'info');

  // Primero necesitamos crear un usuario teacher y obtener su token
  // Para simplificar, usaremos el admin como teacher temporalmente
  // En producción, esto sería un usuario teacher separado

  // Obtener el DNI del teacher creado
  const teacherInfoResult = await request('GET', `/teachers/${teacherId}`, null, adminToken);
  let teacherDni = '12345678'; // Valor por defecto
  
  if (teacherInfoResult.success) {
    teacherDni = teacherInfoResult.data.dni;
    log(`DNI del docente: ${teacherDni}`, 'info');
  }

  // Crear usuario teacher usando el endpoint de registro de auth
  const teacherUserResult = await request('POST', '/auth/register', {
    username: teacherDni,
    password: 'teacher123',
    role: 'teacher',
    related_id: teacherId
  });

  if (!teacherUserResult.success) {
    // Si falla, puede ser que ya exista, intentar login de todas formas
    log('Usuario teacher puede que ya exista, intentando login...', 'warning');
  }

  // Intentar login con el DNI del teacher
  const teacherLoginResult = await request('POST', '/auth/login', {
    dni: teacherDni,
    password: 'teacher123'
  });

  if (teacherLoginResult.success) {
    teacherToken = teacherLoginResult.data.token;
    log('Docente autenticado', 'success');
  } else {
    log(`Error en login de docente: ${JSON.stringify(teacherLoginResult.error)}`, 'error');
    return false;
  }

  // Marcar asistencia
  const today = new Date().toISOString().split('T')[0];
  const attendanceData = {
    schedule_id: scheduleId,
    student_id: studentId,
    status: 'presente'
  };

  const result = await request('POST', `/teachers/${teacherId}/attendance`, attendanceData, teacherToken);
  
  if (result.success) {
    log('Asistencia marcada correctamente', 'success');
    return true;
  } else {
    log(`Error marcando asistencia: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 10: Verificar dashboard admin
// ============================================
async function paso10_VerificarDashboardAdmin() {
  log('\n=== PASO 10: Verificar dashboard admin ===', 'info');

  const result = await request('GET', '/admin/dashboard', null, adminToken);
  
  if (result.success) {
    const dashboard = result.data;
    log(`Dashboard obtenido con ${dashboard.length} registros`, 'success');
    
    if (dashboard.length > 0) {
      const studentRecord = dashboard.find(d => d.student_id === studentId);
      if (studentRecord) {
        log(`Estudiante encontrado en dashboard: ${studentRecord.student_name}`, 'success');
        log(`Estado de alerta: ${studentRecord.alert_status}`, 'info');
        return true;
      } else {
        log('Estudiante no encontrado en dashboard', 'warning');
        return false;
      }
    } else {
      log('Dashboard vacío', 'warning');
      return false;
    }
  } else {
    log(`Error obteniendo dashboard: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// PASO 11: Verificar analytics
// ============================================
async function paso11_VerificarAnalytics() {
  log('\n=== PASO 11: Verificar analytics ===', 'info');

  const result = await request('GET', `/admin/analytics?cycle_id=${cycleId}`, null, adminToken);
  
  if (result.success) {
    const analytics = result.data;
    log(`Analytics obtenidos: ${analytics.length} registros`, 'success');
    return true;
  } else {
    log(`Error obteniendo analytics: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function ejecutarPruebas() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  PRUEBAS DEL FLUJO DEL SISTEMA - ACADEMIA V2${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);

  const pasos = [
    { nombre: 'PASO 0: Verificar servidor', fn: paso0_VerificarServidor },
    { nombre: 'PASO 1: Crear ciclo', fn: paso1_CrearCiclo },
    { nombre: 'PASO 2: Agregar cursos y docentes', fn: paso2_AgregarCursosYDocentes },
    { nombre: 'PASO 3: Publicar ofertas', fn: paso3_PublicarOfertas },
    { nombre: 'PASO 4: Definir horarios', fn: paso4_DefinirHorarios },
    { nombre: 'PASO 5: Alumno se registra', fn: paso5_AlumnoSeRegistra },
    { nombre: 'PASO 6: Alumno se matricula', fn: paso6_AlumnoSeMatricula },
    { nombre: 'PASO 7: Admin revisa matrículas', fn: paso7_AdminRevisaMatriculas },
    { nombre: 'PASO 8: Admin acepta matrícula', fn: paso8_AdminAceptaMatricula },
    { nombre: 'PASO 9: Docente marca asistencias', fn: paso9_DocenteMarcaAsistencias },
    { nombre: 'PASO 10: Verificar dashboard admin', fn: paso10_VerificarDashboardAdmin },
    { nombre: 'PASO 11: Verificar analytics', fn: paso11_VerificarAnalytics }
  ];

  let exitosas = 0;
  let fallidas = 0;

  for (const paso of pasos) {
    try {
      const resultado = await paso.fn();
      if (resultado) {
        exitosas++;
      } else {
        fallidas++;
        log(`Paso fallido: ${paso.nombre}`, 'error');
        // Continuar con los siguientes pasos
      }
    } catch (error) {
      fallidas++;
      log(`Error en ${paso.nombre}: ${error.message}`, 'error');
    }
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  RESUMEN DE PRUEBAS${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Pruebas exitosas: ${exitosas}${colors.reset}`);
  console.log(`${colors.red}Pruebas fallidas: ${fallidas}${colors.reset}`);
  console.log(`${colors.cyan}Total de pruebas: ${pasos.length}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (fallidas === 0) {
    console.log(`${colors.green}¡Todas las pruebas pasaron exitosamente!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}Algunas pruebas fallaron. Revisa los errores arriba.${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar pruebas
if (require.main === module) {
  ejecutarPruebas().catch(error => {
    console.error(`${colors.red}Error fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { ejecutarPruebas };

