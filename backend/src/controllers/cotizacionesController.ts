import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener la cotización actual
export const getCotizacionActual = async (req: Request, res: Response) => {
  try {
    console.log('📊 Obteniendo cotización actual...');

    const cotizacion = await (prisma as any).cotizacion.findFirst({
      include: {
        actualizadoPor: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaActualizacion: 'desc' }
    });

    if (!cotizacion) {
      // Devolver cotizaciones por defecto si no hay ninguna
      return res.json({
        dolar: 0,
        dolarViejo: 0,
        real: 0,
        fechaActualizacion: new Date(),
        actualizadoPor: 'Sistema'
      });
    }

    console.log('✅ Cotización obtenida:', cotizacion.dolar);
    res.json({
      id: cotizacion.id,
      dolar: cotizacion.dolar,
      dolarViejo: cotizacion.dolarViejo,
      real: cotizacion.real,
      fechaActualizacion: cotizacion.fechaActualizacion,
      actualizadoPor: cotizacion.actualizadoPor.nombre
    });

  } catch (error) {
    console.error('❌ Error obteniendo cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar cotizaciones (solo admin)
export const actualizarCotizaciones = async (req: Request, res: Response) => {
  try {
    console.log('💰 Actualizando cotizaciones...', req.body);

    const { dolar, dolarViejo, real, actualizadoPor } = req.body;

    // Validación de campos requeridos
    if (dolar === undefined || dolarViejo === undefined || real === undefined || !actualizadoPor) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: dolar, dolarViejo, real, actualizadoPor'
      });
    }

    // Validar que sean números
    if (isNaN(dolar) || isNaN(dolarViejo) || isNaN(real)) {
      return res.status(400).json({
        error: 'Los valores de cotización deben ser números válidos'
      });
    }

    // Buscar al usuario por nombre para obtener su ID
    const usuario = await prisma.usuario.findUnique({
      where: { nombre: actualizadoPor }
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que sea admin
    if (usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden actualizar cotizaciones' });
    }

    const nuevaCotizacion = await (prisma as any).cotizacion.create({
      data: {
        dolar: parseFloat(dolar),
        dolarViejo: parseFloat(dolarViejo),
        real: parseFloat(real),
        actualizadoPorId: usuario.id
      },
      include: {
        actualizadoPor: {
          select: { nombre: true }
        }
      }
    });

    console.log('✅ Cotizaciones actualizadas:', nuevaCotizacion.id);
    res.status(201).json({
      id: nuevaCotizacion.id,
      dolar: nuevaCotizacion.dolar,
      dolarViejo: nuevaCotizacion.dolarViejo,
      real: nuevaCotizacion.real,
      fechaActualizacion: nuevaCotizacion.fechaActualizacion,
      actualizadoPor: nuevaCotizacion.actualizadoPor.nombre
    });

  } catch (error) {
    console.error('❌ Error actualizando cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener historial de cotizaciones (opcional para admin)
export const getHistorialCotizaciones = async (req: Request, res: Response) => {
  try {
    console.log('📈 Obteniendo historial de cotizaciones...');

    const historial = await (prisma as any).cotizacion.findMany({
      include: {
        actualizadoPor: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaActualizacion: 'desc' },
      take: 10 // Últimas 10 actualizaciones
    });

    console.log(`✅ Enviando ${historial.length} registros de historial`);
    res.json(historial.map((cotizacion: any) => ({
      id: cotizacion.id,
      dolar: cotizacion.dolar,
      dolarViejo: cotizacion.dolarViejo,
      real: cotizacion.real,
      fechaActualizacion: cotizacion.fechaActualizacion,
      actualizadoPor: cotizacion.actualizadoPor.nombre
    })));

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};