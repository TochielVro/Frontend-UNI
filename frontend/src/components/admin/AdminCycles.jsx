// src/components/admin/AdminCycles.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { cyclesAPI } from '../../services/api';

const AdminCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    duration_months: '',
    status: 'open',
  });

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const data = await cyclesAPI.getAll();
      setCycles(data);
    } catch (err) {
      console.error('Error cargando ciclos:', err);
      alert('Error al cargar ciclos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cycle = null) => {
    if (cycle) {
      setEditingCycle(cycle);
      setFormData({
        name: cycle.name || '',
        start_date: cycle.start_date || '',
        end_date: cycle.end_date || '',
        duration_months: cycle.duration_months || '',
        status: cycle.status || 'open',
      });
    } else {
      setEditingCycle(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        duration_months: '',
        status: 'open',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCycle(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCycle) {
        await cyclesAPI.update(editingCycle.id, formData);
      } else {
        await cyclesAPI.create(formData);
      }
      handleCloseDialog();
      loadCycles();
    } catch (err) {
      console.error('Error guardando ciclo:', err);
      alert(err.message || 'Error al guardar ciclo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ciclo?')) return;
    try {
      await cyclesAPI.delete(id);
      loadCycles();
    } catch (err) {
      console.error('Error eliminando ciclo:', err);
      alert(err.message || 'Error al eliminar ciclo');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open':
        return 'Abierto';
      case 'in_progress':
        return 'En Progreso';
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Ciclos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Ciclo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Duración (meses)</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell>{cycle.id}</TableCell>
                <TableCell>{cycle.name}</TableCell>
                <TableCell>{new Date(cycle.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(cycle.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{cycle.duration_months || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(cycle.status)}
                    color={getStatusColor(cycle.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenDialog(cycle)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cycle.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {cycles.length === 0 && !loading && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No hay ciclos registrados</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCycle ? 'Editar Ciclo' : 'Nuevo Ciclo'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nombre del Ciclo"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Fecha Inicio"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <TextField
              label="Fecha Fin"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <TextField
              label="Duración (meses)"
              type="number"
              fullWidth
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
            />
            <TextField
              label="Estado"
              select
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="open">Abierto</MenuItem>
              <MenuItem value="in_progress">En Progreso</MenuItem>
              <MenuItem value="closed">Cerrado</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCycle ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCycles;

