// src/components/admin/AdminEnrollmentsComplete.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { enrollmentsAPI } from '../../services/api';

const AdminEnrollmentsComplete = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.getAllAdmin();
      setEnrollments(data);
    } catch (err) {
      console.error('Error cargando matrículas:', err);
      alert('Error al cargar matrículas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (enrollmentId, status) => {
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, status);
      alert(`Matrícula ${status} correctamente`);
      loadEnrollments();
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aceptado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
        return 'error';
      case 'cancelado':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredEnrollments = statusFilter === 'all'
    ? enrollments
    : enrollments.filter(e => e.status === statusFilter);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Matrículas
      </Typography>

      <Box mb={2}>
        <TextField
          select
          label="Filtrar por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="pendiente">Pendientes</MenuItem>
          <MenuItem value="aceptado">Aceptados</MenuItem>
          <MenuItem value="rechazado">Rechazados</MenuItem>
          <MenuItem value="cancelado">Cancelados</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Curso/Paquete</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Voucher</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.id}</TableCell>
                <TableCell>
                  {enrollment.first_name} {enrollment.last_name}
                </TableCell>
                <TableCell>{enrollment.dni}</TableCell>
                <TableCell>{enrollment.item_name || '-'}</TableCell>
                <TableCell>{enrollment.enrollment_type}</TableCell>
                <TableCell>
                  <Chip
                    label={enrollment.status}
                    color={getStatusColor(enrollment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>S/. {parseFloat(enrollment.installment_amount || 0).toFixed(2)}</TableCell>
                <TableCell>
                  {enrollment.voucher_url ? (
                    <Button
                      size="small"
                      href={`http://localhost:4000${enrollment.voucher_url}`}
                      target="_blank"
                    >
                      Ver Voucher
                    </Button>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Sin voucher
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {enrollment.status === 'pendiente' && (
                    <Box>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleUpdateStatus(enrollment.id, 'aceptado')}
                        title="Aceptar"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUpdateStatus(enrollment.id, 'rechazado')}
                        title="Rechazar"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setOpenDialog(true);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredEnrollments.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No hay matrículas</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Dialog de detalles */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de Matrícula</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="ID"
                value={selectedEnrollment.id}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Estudiante"
                value={`${selectedEnrollment.first_name} ${selectedEnrollment.last_name}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="DNI"
                value={selectedEnrollment.dni}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Curso/Paquete"
                value={selectedEnrollment.item_name || '-'}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Tipo"
                value={selectedEnrollment.enrollment_type}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Estado"
                value={selectedEnrollment.status}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Monto"
                value={`S/. ${parseFloat(selectedEnrollment.installment_amount || 0).toFixed(2)}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              {selectedEnrollment.voucher_url && (
                <Button
                  variant="outlined"
                  href={`http://localhost:4000${selectedEnrollment.voucher_url}`}
                  target="_blank"
                >
                  Ver Voucher
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEnrollmentsComplete;

