import express from 'express';
import {
  getCotizacionActual,
  actualizarCotizaciones,
  getHistorialCotizaciones
} from '../controllers/cotizacionesController';

const router = express.Router();

// GET /api/cotizaciones - Obtener cotización actual (público)
router.get('/', getCotizacionActual);

// POST /api/cotizaciones - Actualizar cotizaciones (solo admin)
router.post('/', actualizarCotizaciones);

// GET /api/cotizaciones/historial - Obtener historial (opcional)
router.get('/historial', getHistorialCotizaciones);

export default router;