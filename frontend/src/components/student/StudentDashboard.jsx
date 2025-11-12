// src/components/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [openPay, setOpenPay] = useState(false);
  const [payments, setPayments] = useState([]);
  const [voucherFile, setVoucherFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/courses', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(setCourses).catch(e => console.error(e));

    fetch('http://localhost:4000/api/packages')
      .then(r => r.json()).then(setPackages).catch(e => console.error(e));
  }, []);

  const toggleSelect = (type, id, name, price) => {
    const key = `${type}-${id}`;
    const exists = selected.find(s => s.key === key);
    if (exists) setSelected(selected.filter(s => s.key !== key));
    else setSelected([...selected, { key, type, id, name, price }]);
  };

  const total = selected.reduce((s, i) => s + Number(i.price || 0), 0);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const items = selected.map(i => ({ type: i.type, id: i.id }));
      const res = await fetch('http://localhost:4000/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      // preparar pagos para subir voucher
      const created = data.created || [];
      setPayments(created);
      setOpenPay(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al crear matrícula');
    }
  };

  const handleUpload = async (enrollmentId) => {
    try {
      if (!voucherFile) return setError('Seleccione un voucher');
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('voucher', voucherFile);
      form.append('enrollment_id', enrollmentId);

      const res = await fetch('http://localhost:4000/api/payments/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir voucher');
      alert('Voucher subido correctamente');
      setOpenPay(false);
      setSelected([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al subir voucher');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Cursos disponibles</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {courses.map(c => (
          <Grid item xs={12} md={4} key={c.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Typography variant="body2">{c.description}</Typography>
                <Typography sx={{ mt: 1 }}>Profesor: {c.teacher_name || 'Sin asignar'}</Typography>
                <Typography sx={{ mt: 1 }}>Precio: S/. {c.price}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => toggleSelect('course', c.id, c.name, c.price)}>
                  {selected.find(s => s.key === `course-${c.id}`) ? 'Quitar' : 'Seleccionar'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Paquetes</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {packages.map(p => (
          <Grid item xs={12} md={4} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2">{p.description}</Typography>
                <Typography sx={{ mt: 1 }}>Precio paquete: S/. {p.price_total}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => toggleSelect('package', p.id, p.name, p.price_total)}>
                  {selected.find(s => s.key === `package-${p.id}`) ? 'Quitar' : 'Seleccionar'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography>Total: S/. {total.toFixed(2)}</Typography>
        <Button variant="contained" sx={{ mt: 1 }} disabled={selected.length === 0} onClick={handleCreate}>Generar matrícula y pagar</Button>
      </Box>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      <Dialog open={openPay} onClose={() => setOpenPay(false)} fullWidth>
        <DialogTitle>Subir Voucher de Pago</DialogTitle>
        <DialogContent>
          <Typography>Adjunta el voucher para cada pago generado.</Typography>
          <Box sx={{ mt: 2 }}>
            <input type="file" onChange={(e) => setVoucherFile(e.target.files[0])} />
          </Box>
          <Box sx={{ mt: 2 }}>
            {payments.map(p => (
              <Box key={p.enrollmentId} sx={{ mb: 1 }}>
                <Typography>{p.type} - id: {p.target_id} - Monto: S/. {p.amount}</Typography>
                <Button variant="outlined" onClick={() => handleUpload(p.enrollmentId)} sx={{ mt: 1 }}>Subir voucher</Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPay(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
