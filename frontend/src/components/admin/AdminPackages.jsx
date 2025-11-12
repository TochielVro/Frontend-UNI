// src/components/admin/AdminPackages.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { packagesAPI, cyclesAPI } from '../../services/api';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [editing, setEditing] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const [packageForm, setPackageForm] = useState({ name: '', price_total: '' });
  const [openOfferingDialog, setOpenOfferingDialog] = useState(false);
  const [cycles, setCycles] = useState([]);
  const [offeringForm, setOfferingForm] = useState({ package_id: '', cycle_id: '', group_label: '', price_override: '', capacity: '' });

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/packages', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setPackages(data);
    } catch (err) { console.error(err); }
  };

  const fetchOfferings = async () => {
    try {
      const data = await packagesAPI.getOfferings();
      setOfferings(data || []);
    } catch (err) {
      console.error('Error fetching package offerings', err);
    }
  };

  const fetchCycles = async () => {
    try {
      const data = await cyclesAPI.getAll();
      setCycles(data || []);
    } catch (err) {
      console.error('Error loading cycles', err);
    }
  };

  useEffect(() => { fetchPackages(); fetchOfferings(); fetchCycles(); }, []);

  const startEdit = (p) => setEditing({ ...p });
  const save = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setEditing({});
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar paquete?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/packages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const handleCreatePackage = async () => {
    try {
      await packagesAPI.create(packageForm);
      setOpenPackageDialog(false);
      setPackageForm({ name: '', price_total: '' });
      await fetchPackages();
    } catch (err) {
      console.error('Error creating package', err);
      alert(err.message || 'Error al crear paquete');
    }
  };

  const handleCreateOffering = async () => {
    try {
      await packagesAPI.createOffering({
        ...offeringForm,
        price_override: offeringForm.price_override || null,
        capacity: offeringForm.capacity || null,
      });
      setOpenOfferingDialog(false);
      setOfferingForm({ package_id: '', cycle_id: '', group_label: '', price_override: '', capacity: '' });
      await fetchOfferings();
    } catch (err) {
      console.error('Error creating package offering', err);
      alert(err.message || 'Error al crear oferta de paquete');
    }
  };

  const handleDeleteOffering = async (id) => {
    if (!confirm('¿Eliminar oferta de paquete?')) return;
    try {
      await packagesAPI.deleteOffering(id);
      await fetchOfferings();
    } catch (err) {
      console.error('Error deleting offering', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Gestión de Paquetes</Typography>
        <Box>
          {tabValue === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPackageDialog(true)}>
              Nuevo Paquete
            </Button>
          )}
          {tabValue === 1 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenOfferingDialog(true)} sx={{ ml: 1 }}>
              Nueva Oferta
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Paquetes" />
        <Tab label="Ofertas" />
      </Tabs>

      {tabValue === 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Precio total</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{editing.id === p.id ? (
                    <TextField size="small" type="number" value={editing.price_total} onChange={(e) => setEditing({ ...editing, price_total: e.target.value })} />
                  ) : (`S/. ${p.price_total}`)}</TableCell>
                  <TableCell>
                    {editing.id === p.id ? (
                      <>
                        <Button size="small" onClick={() => save(p.id)}>Guardar</Button>
                        <Button size="small" onClick={() => setEditing({})}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="small" onClick={() => startEdit(p)}>Editar</Button>
                        <Button size="small" color="error" onClick={() => remove(p.id)}>Eliminar</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tabValue === 1 && (
        <Box>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Paquete</TableCell>
                  <TableCell>Ciclo</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Capacidad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offerings.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.package_name || '-'}</TableCell>
                    <TableCell>{o.cycle_name || '-'}</TableCell>
                    <TableCell>{o.group_label || '-'}</TableCell>
                    <TableCell>S/. {parseFloat(o.price_override || o.base_price || 0).toFixed(2)}</TableCell>
                    <TableCell>{o.capacity || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteOffering(o.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Dialog: Crear Paquete */}
      <Dialog open={openPackageDialog} onClose={() => setOpenPackageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Paquete</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} fullWidth />
            <TextField label="Precio total" type="number" value={packageForm.price_total} onChange={(e) => setPackageForm({ ...packageForm, price_total: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPackageDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreatePackage}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Crear Oferta de Paquete */}
      <Dialog open={openOfferingDialog} onClose={() => setOpenOfferingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Oferta de Paquete</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Paquete" value={offeringForm.package_id} onChange={(e) => setOfferingForm({ ...offeringForm, package_id: e.target.value })} fullWidth>
              {packages.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Ciclo" value={offeringForm.cycle_id} onChange={(e) => setOfferingForm({ ...offeringForm, cycle_id: e.target.value })} fullWidth>
              {cycles.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Grupo" value={offeringForm.group_label} onChange={(e) => setOfferingForm({ ...offeringForm, group_label: e.target.value })} fullWidth />
            <TextField label="Precio (opcional)" type="number" value={offeringForm.price_override} onChange={(e) => setOfferingForm({ ...offeringForm, price_override: e.target.value })} fullWidth />
            <TextField label="Capacidad (opcional)" type="number" value={offeringForm.capacity} onChange={(e) => setOfferingForm({ ...offeringForm, capacity: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfferingDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateOffering}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPackages;
