# 🚀 Acceso Rápido al Sistema

## 📋 Credenciales para Iniciar Sesión

---

## 👨‍💼 ADMINISTRADOR

```
Usuario:    admin
Contraseña: admin123
```

**Acceso:** Panel administrativo completo  
**URL después del login:** `/admin/dashboard`

---

## 👨‍🏫 DOCENTES

### Docente 1 - Matemáticas
```
DNI:        12345678
Contraseña: docente123
Nombre:     Juan Pérez
```

### Docente 2 - Física
```
DNI:        87654321
Contraseña: docente123
Nombre:     María García
```

### Docente 3 - Química
```
DNI:        11223344
Contraseña: docente123
Nombre:     Carlos López
```

**Acceso:** Panel de docente  
**URL después del login:** `/teacher/dashboard`

---

## 👨‍🎓 ESTUDIANTES

### Estudiante 1
```
DNI:        76543210
Contraseña: estudiante123
Nombre:     Ana Martínez
```

### Estudiante 2
```
DNI:        65432109
Contraseña: estudiante123
Nombre:     Luis Rodríguez
```

### Estudiante 3
```
DNI:        54321098
Contraseña: estudiante123
Nombre:     Sofía Fernández
```

### Estudiante 4
```
DNI:        43210987
Contraseña: estudiante123
Nombre:     Diego González
```

### Estudiante 5
```
DNI:        32109876
Contraseña: estudiante123
Nombre:     Valentina Sánchez
```

**Acceso:** Panel de estudiante  
**URL después del login:** `/student/dashboard`

---

## 🎯 Flujo de Prueba Rápido

### Paso 1: Como Administrador
1. Inicia sesión con `admin` / `admin123`
2. Ve a "Ciclos" y crea un ciclo
3. Ve a "Cursos" y crea cursos
4. Crea ofertas de cursos para el ciclo
5. Asigna docentes a las ofertas
6. Define horarios para las ofertas

### Paso 2: Como Estudiante
1. Inicia sesión con cualquier estudiante (ej: `76543210` / `estudiante123`)
2. Ve a "Cursos Disponibles"
3. Selecciona cursos y matricúlate
4. Sube vouchers de pago en "Mis Matrículas"

### Paso 3: Como Administrador
1. Ve a "Matrículas" y acepta las matrículas pendientes
2. Ve a "Pagos" y aprueba los pagos

### Paso 4: Como Docente
1. Inicia sesión con un docente (ej: `12345678` / `docente123`)
2. Ve a "Marcar Asistencias"
3. Marca las asistencias de los estudiantes

### Paso 5: Como Administrador
1. Ve a "Dashboard" y revisa las estadísticas
2. Verifica asistencias y pagos

---

## 💡 Tips

- **Todos los usuarios de prueba tienen contraseñas simples** para facilitar las pruebas
- **El DNI se usa como nombre de usuario** para estudiantes y docentes
- **Las contraseñas son:**
  - Admin: `admin123`
  - Docentes: `docente123`
  - Estudiantes: `estudiante123`

---

## 🔄 Crear Nuevos Usuarios de Prueba

Si necesitas recrear los usuarios de prueba:

```bash
cd backend
npm run create:test-users
```

---

## 📞 Problemas de Acceso

Si no puedes iniciar sesión:

1. Verifica que el backend esté corriendo en `http://localhost:4000`
2. Verifica que los usuarios existan en la base de datos
3. Verifica que estés usando el DNI correcto como usuario
4. Verifica que la contraseña sea correcta (sin espacios)

---

¡Listo para probar! 🎉

