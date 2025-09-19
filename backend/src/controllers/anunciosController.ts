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

    // Validación más específica con logging
    const camposFaltantes = [];
    if (!tipo) camposFaltantes.push('tipo');
    if (!titulo) camposFaltantes.push('titulo');
    if (!descripcion) camposFaltantes.push('descripcion');
    if (!sectores) camposFaltantes.push('sectores');
    if (!estado) camposFaltantes.push('estado');
    if (!creadoPor) camposFaltantes.push('creadoPor');
    
    // La prioridad es requerida solo para tareas
    if (tipo === 'tarea' && !prioridad) {
      camposFaltantes.push('prioridad');
    }

    if (camposFaltantes.length > 0) {
      console.log('❌ Campos faltantes:', camposFaltantes);
      return res.status(400).json({ error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}` });
    }

    // Buscar al usuario por nombre para obtener su ID
    console.log('🔍 Buscando usuario:', creadoPor);
    const usuario = await prisma.usuario.findUnique({
      where: { nombre: creadoPor }
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado:', creadoPor);
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    console.log('✅ Usuario encontrado:', usuario.nombre, 'ID:', usuario.id);

    const nuevoAnuncio = await prisma.anuncio.create({
      data: {
        tipo,
        titulo,
        descripcion,
        sectores,
        prioridad: tipo === 'tarea' ? prioridad : 'media', // Para pizarras usamos prioridad media por defecto
        estado,
        creadoPorId: usuario.id
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' });
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

    // Buscar al usuario por nombre para obtener su ID
    const usuario = await prisma.usuario.findUnique({
      where: { nombre: autor }
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto,
        autorId: usuario.id,
        anuncioId: id
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