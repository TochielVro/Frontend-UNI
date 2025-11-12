// src/components/student/StudentAvailableCourses.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { coursesAPI, packagesAPI, cyclesAPI, enrollmentsAPI } from '../../services/api';

const StudentAvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, packagesData, cyclesData, packageOfferingsData] = await Promise.all([
        coursesAPI.getAll(),
        packagesAPI.getAll(),
        cyclesAPI.getActive(),
        packagesAPI.getOfferings().catch(() => []), // Si falla, usar array vacío
      ]);
      setCourses(coursesData);
      setCycles(cyclesData);
      
      // Guardar las ofertas de paquetes para usarlas después
      const packagesWithOfferings = packagesData.map(pkg => {
        const offerings = packageOfferingsData.filter(po => po.package_id === pkg.id);
        return { ...pkg, offerings };
      });
      setPackages(packagesWithOfferings);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar cursos disponibles');
    } finally {
      setLoading(false);
    }
  };

  // Obtener ofertas de cursos
  const getCourseOfferings = (course) => {
    if (!course.offerings || course.offerings.length === 0) return [];
    return course.offerings.filter(offering => {
      // Filtrar solo ofertas de ciclos activos
      return cycles.some(cycle => cycle.id === offering.cycle_id);
    });
  };

  const toggleSelection = (type, offeringId, name, price) => {
    const key = `${type}-${offeringId}`;
    const exists = selectedItems.find(item => item.key === key);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.key !== key));
    } else {
      setSelectedItems([...selectedItems, { key, type, id: offeringId, name, price }]);
    }
  };

  const handleEnroll = async () => {
    if (selectedItems.length === 0) {
      setError('Selecciona al menos un curso o paquete');
      return;
    }

    try {
      setError('');
      const items = selectedItems.map(item => ({
        type: item.type,
        id: item.id,
      }));
      const result = await enrollmentsAPI.create(items);
      setSuccess('Matrícula creada correctamente. Ahora puedes subir el voucher de pago.');
      setSelectedItems([]);
      setOpenDialog(false);
      // Recargar datos
      loadData();
    } catch (err) {
      setError(err.message || 'Error al crear matrícula');
    }
  };

  const total = selectedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cursos y Paquetes Disponibles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Cursos */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Cursos
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {courses.map((course) => {
          const offerings = getCourseOfferings(course);
          if (offerings.length === 0) return null;

          return offerings.map((offering) => {
            const price = offering.price_override || course.base_price || 0;
            const isSelected = selectedItems.some(item => item.key === `course-${offering.id}`);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={offering.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {course.description || 'Sin descripción'}
                    </Typography>
                    <Chip
                      label={offering.group_label || 'Grupo A'}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={offering.cycle_name || 'Ciclo'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    {offering.first_name && offering.last_name && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Docente: {offering.first_name} {offering.last_name}
                      </Typography>
                    )}
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      S/. {parseFloat(price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant={isSelected ? 'outlined' : 'contained'}
                      onClick={() => toggleSelection('course', offering.id, course.name, price)}
                    >
                      {isSelected ? 'Quitar' : 'Seleccionar'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          });
        })}
      </Grid>

      {/* Paquetes */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Paquetes
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {packages.map((pkg) => {
          const offerings = pkg.offerings || [];
          if (offerings.length === 0) return null;

          return offerings.map((offering) => {
            // Filtrar solo ofertas de ciclos activos
            const isActiveCycle = cycles.some(cycle => cycle.id === offering.cycle_id);
            if (!isActiveCycle) return null;

            const price = offering.price_override || pkg.base_price || 0;
            const isSelected = selectedItems.some(item => item.key === `package-${offering.id}`);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={offering.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{pkg.name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {pkg.description || 'Sin descripción'}
                    </Typography>
                    <Chip
                      label={offering.group_label || 'Grupo A'}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={offering.cycle_name || 'Ciclo'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      S/. {parseFloat(price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant={isSelected ? 'outlined' : 'contained'}
                      onClick={() => toggleSelection('package', offering.id, pkg.name, price)}
                    >
                      {isSelected ? 'Quitar' : 'Seleccionar'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          });
        })}
      </Grid>

      {/* Resumen y botón de matrícula */}
      {selectedItems.length > 0 && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            p: 2,
            boxShadow: 3,
            mt: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Total: S/. {total.toFixed(2)} ({selectedItems.length} item(s) seleccionado(s))
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setOpenDialog(true)}
            >
              Matricularme
            </Button>
          </Box>
        </Box>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Matrícula</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de matricularte en los siguientes items?
          </Typography>
          <Box sx={{ mt: 2 }}>
            {selectedItems.map((item) => (
              <Typography key={item.key} variant="body2">
                - {item.name} ({item.type}): S/. {parseFloat(item.price).toFixed(2)}
              </Typography>
            ))}
          </Box>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: S/. {total.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleEnroll} variant="contained">
            Confirmar Matrícula
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAvailableCourses;

