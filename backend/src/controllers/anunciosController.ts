import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los anuncios
export const getAnuncios = async (req: Request, res: Response) => {
  try {
    console.log('📄 Obteniendo anuncios...');
    
    const anuncios = await prisma.anuncio.findMany({
      include: {
        comentarios: {
          include: {
            autor: {
              select: { nombre: true }
            }
          }
        },
        creadoPor: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Mapear al formato esperado por el frontend
    const anunciosMapeados = anuncios.map(anuncio => ({
      id: anuncio.id,
      tipo: anuncio.tipo,
      titulo: anuncio.titulo,
      descripcion: anuncio.descripcion,
      sectores: anuncio.sectores,
      prioridad: anuncio.prioridad,
      estado: anuncio.estado,
      fechaCreacion: anuncio.fechaCreacion,
      fechaModificacion: anuncio.fechaModificacion,
      creadoPor: anuncio.creadoPor?.nombre || '',
      comentarios: anuncio.comentarios.map(comentario => ({
        id: comentario.id,
        texto: comentario.texto,
        autor: comentario.autor.nombre,
        fecha: comentario.fecha
      }))
    }));

    console.log(`✅ Enviando ${anunciosMapeados.length} anuncios`);
    res.json(anunciosMapeados);

  } catch (error) {
    console.error('❌ Error obteniendo anuncios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un anuncio
export const createAnuncio = async (req: Request, res: Response) => {
  try {
    console.log('📝 Creando anuncio...', req.body);
    
    const { tipo, titulo, descripcion, sectores, prioridad, estado, creadoPor } = req.body;

    if (!tipo || !titulo || !descripcion || !sectores || !prioridad || !estado || !creadoPor) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const nuevoAnuncio = await prisma.anuncio.create({
      data: {
        tipo,
        titulo,
        descripcion,
        sectores,
        prioridad,
        estado,
        creadoPor: { connect: { nombre: creadoPor } }
      },
      include: {
        creadoPor: {
          select: { nombre: true }
        },
        comentarios: true
      }
    });

    console.log('✅ Anuncio creado:', nuevoAnuncio.id);
    res.status(201).json({
      id: nuevoAnuncio.id,
      tipo: nuevoAnuncio.tipo,
      titulo: nuevoAnuncio.titulo,
      descripcion: nuevoAnuncio.descripcion,
      sectores: nuevoAnuncio.sectores,
      prioridad: nuevoAnuncio.prioridad,
      estado: nuevoAnuncio.estado,
      fechaCreacion: nuevoAnuncio.fechaCreacion,
      fechaModificacion: nuevoAnuncio.fechaModificacion,
      creadoPor: nuevoAnuncio.creadoPor?.nombre || '',
      comentarios: []
    });

  } catch (error) {
    console.error('❌ Error creando anuncio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un anuncio
export const updateAnuncio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📝 Actualizando anuncio:', id, req.body);

    const anuncioActualizado = await prisma.anuncio.update({
      where: { id },
      data: {
        ...req.body,
        fechaModificacion: new Date()
      },
      include: {
        creadoPor: {
          select: { nombre: true }
        },
        comentarios: {
          include: {
            autor: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    console.log('✅ Anuncio actualizado:', id);
    res.json({
      id: anuncioActualizado.id,
      tipo: anuncioActualizado.tipo,
      titulo: anuncioActualizado.titulo,
      descripcion: anuncioActualizado.descripcion,
      sectores: anuncioActualizado.sectores,
      prioridad: anuncioActualizado.prioridad,
      estado: anuncioActualizado.estado,
      fechaCreacion: anuncioActualizado.fechaCreacion,
      fechaModificacion: anuncioActualizado.fechaModificacion,
      creadoPor: anuncioActualizado.creadoPor?.nombre || '',
      comentarios: anuncioActualizado.comentarios.map(comentario => ({
        id: comentario.id,
        texto: comentario.texto,
        autor: comentario.autor.nombre,
        fecha: comentario.fecha
      }))
    });

  } catch (error) {
    console.error('❌ Error actualizando anuncio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un anuncio
export const deleteAnuncio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando anuncio:', id);

    await prisma.anuncio.delete({
      where: { id }
    });

    console.log('✅ Anuncio eliminado:', id);
    res.json({ message: 'Anuncio eliminado correctamente' });

  } catch (error) {
    console.error('❌ Error eliminando anuncio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar comentario a un anuncio
export const addComentario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { texto, autor } = req.body;
    console.log('💬 Agregando comentario al anuncio:', id, { texto, autor });

    if (!texto || !autor) {
      return res.status(400).json({ error: 'Texto y autor son requeridos' });
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto,
        autor: { connect: { nombre: autor } },
        anuncio: { connect: { id } }
      },
      include: {
        autor: {
          select: { nombre: true }
        }
      }
    });

    console.log('✅ Comentario agregado:', comentario.id);
    res.status(201).json({
      id: comentario.id,
      texto: comentario.texto,
      autor: comentario.autor.nombre,
      fecha: comentario.fecha
    });

  } catch (error) {
    console.error('❌ Error agregando comentario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};