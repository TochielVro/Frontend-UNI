// tests/ejecutar-pruebas-completo.js
// Script para ejecutar las pruebas del flujo completo
// Este script inicia el servidor, verifica la configuración y ejecuta las pruebas

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = type === 'success' ? `${colors.green}✓` : 
                 type === 'error' ? `${colors.red}✗` : 
                 type === 'warning' ? `${colors.yellow}⚠` : 
                 `${colors.cyan}ℹ`;
  console.log(`${prefix} ${message}${colors.reset}`);
}

async function esperarServidor(url, maxIntentos = 30) {
  for (let i = 0; i < maxIntentos; i++) {
    try {
      const response = await axios.get(url, { timeout: 2000, validateStatus: () => true });
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        return true;
      }
    } catch (error) {
      // Servidor aún no está listo
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function ejecutarPruebasCompleto() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  EJECUCIÓN COMPLETA DE PRUEBAS - ACADEMIA V2${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Paso 1: Verificar configuración
  log('Paso 1: Verificando configuración...', 'info');
  const verificarSetup = spawn('node', ['tests/verificar-setup.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve) => {
    verificarSetup.on('close', (code) => {
      if (code === 0) {
        log('Configuración verificada correctamente', 'success');
      } else {
        log('Hay advertencias en la configuración, pero continuamos...', 'warning');
      }
      resolve();
    });
  });

  // Paso 2: Verificar si el servidor está corriendo
  log('\nPaso 2: Verificando servidor...', 'info');
  const servidorActivo = await esperarServidor('http://localhost:4000/api/cycles');
  
  let servidorProcess = null;

  if (!servidorActivo) {
    log('Servidor no está corriendo, iniciándolo...', 'warning');
    
    servidorProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      shell: true
    });

    servidorProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Servidor corriendo') || output.includes('listening')) {
        log('Servidor iniciado', 'success');
      }
    });

    servidorProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    // Esperar a que el servidor esté listo
    log('Esperando a que el servidor esté listo...', 'info');
    const servidorListo = await esperarServidor('http://localhost:4000/api/cycles', 30);
    
    if (!servidorListo) {
      log('Error: El servidor no se inició correctamente', 'error');
      if (servidorProcess) {
        servidorProcess.kill();
      }
      process.exit(1);
    }
  } else {
    log('Servidor ya está corriendo', 'success');
  }

  // Paso 3: Ejecutar pruebas del flujo
  log('\nPaso 3: Ejecutando pruebas del flujo...', 'info');
  const pruebas = spawn('node', ['tests/flujo-test.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve) => {
    pruebas.on('close', (code) => {
      if (code === 0) {
        log('\nTodas las pruebas pasaron exitosamente', 'success');
      } else {
        log('\nAlgunas pruebas fallaron', 'error');
      }
      resolve();
    });
  });

  // Limpiar: cerrar el servidor si lo iniciamos
  if (servidorProcess) {
    log('\nCerrando servidor...', 'info');
    servidorProcess.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  PRUEBAS COMPLETADAS${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);
}

ejecutarPruebasCompleto().catch(error => {
  console.error(`${colors.red}Error fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});

