// src/components/auth/Register.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid
} from '@mui/material';

const validationSchema = yup.object({
  dni: yup.string()
    .length(8, 'El DNI debe tener 8 dígitos')
    .required('El DNI es requerido'),
  first_name: yup.string()
    .required('El nombre es requerido'),
  last_name: yup.string()
    .required('El apellido es requerido'),
  phone: yup.string()
    .required('El teléfono es requerido'),
  parent_name: yup.string()
    .required('El nombre del apoderado es requerido'),
  parent_phone: yup.string()
    .required('El teléfono del apoderado es requerido'),
  password: yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const Register = () => {
  const formik = useFormik({
    initialValues: {
      dni: '',
      first_name: '',
      last_name: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch('http://localhost:4000/api/students/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Registro exitoso');
          window.location.href = '/login';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al registrarse');
      }
    },
  });

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Registro de Estudiante
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="dni"
                  name="dni"
                  label="DNI"
                  value={formik.values.dni}
                  onChange={formik.handleChange}
                  error={formik.touched.dni && Boolean(formik.errors.dni)}
                  helperText={formik.touched.dni && formik.errors.dni}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="Nombres"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Apellidos"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="parent_name"
                  name="parent_name"
                  label="Nombre del Apoderado"
                  value={formik.values.parent_name}
                  onChange={formik.handleChange}
                  error={formik.touched.parent_name && Boolean(formik.errors.parent_name)}
                  helperText={formik.touched.parent_name && formik.errors.parent_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="parent_phone"
                  name="parent_phone"
                  label="Teléfono del Apoderado"
                  value={formik.values.parent_phone}
                  onChange={formik.handleChange}
                  error={formik.touched.parent_phone && Boolean(formik.errors.parent_phone)}
                  helperText={formik.touched.parent_phone && formik.errors.parent_phone}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrarse
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;