// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setDashboard(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar el dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Calcular estadísticas
  const stats = {
    totalStudents: new Set(dashboard.map(d => d.student_id)).size,
    totalEnrollments: dashboard.length,
    pendingEnrollments: dashboard.filter(d => d.enrollment_status === 'pendiente').length,
    acceptedEnrollments: dashboard.filter(d => d.enrollment_status === 'aceptado').length,
    totalPending: dashboard.reduce((sum, d) => sum + (parseFloat(d.total_pending) || 0), 0),
    totalPaid: dashboard.reduce((sum, d) => sum + (parseFloat(d.total_paid) || 0), 0),
    lowAttendance: dashboard.filter(d => parseFloat(d.attendance_pct || 0) < 75).length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aceptado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlertColor = (alert) => {
    if (alert?.includes('Deuda')) return 'error';
    if (alert?.includes('Faltas')) return 'warning';
    if (alert?.includes('Baja asistencia')) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Estudiantes
                  </Typography>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Matrículas Pendientes
                  </Typography>
                  <Typography variant="h4">{stats.pendingEnrollments}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PaymentIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Pagado
                  </Typography>
                  <Typography variant="h4">S/. {stats.totalPaid.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PaymentIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Pendiente
                  </Typography>
                  <Typography variant="h4">S/. {stats.totalPending.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de estudiantes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Ciclo</TableCell>
              <TableCell>Curso/Paquete</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Asistencia</TableCell>
              <TableCell>Pagado</TableCell>
              <TableCell>Pendiente</TableCell>
              <TableCell>Alerta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dashboard.map((row) => (
              <TableRow key={`${row.student_id}-${row.enrollment_id}`}>
                <TableCell>{row.student_name}</TableCell>
                <TableCell>{row.dni}</TableCell>
                <TableCell>{row.cycle_name}</TableCell>
                <TableCell>{row.enrolled_item}</TableCell>
                <TableCell>
                  <Chip
                    label={row.enrollment_status}
                    color={getStatusColor(row.enrollment_status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{parseFloat(row.attendance_pct || 0).toFixed(1)}%</TableCell>
                <TableCell>S/. {parseFloat(row.total_paid || 0).toFixed(2)}</TableCell>
                <TableCell>S/. {parseFloat(row.total_pending || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={row.alert_status || 'En regla'}
                    color={getAlertColor(row.alert_status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {dashboard.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No hay datos para mostrar</Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard;

