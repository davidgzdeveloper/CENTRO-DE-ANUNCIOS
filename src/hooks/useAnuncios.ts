
import { useState, useEffect, useCallback } from 'react';
import { Anuncio, FiltrosAnuncio } from '@/types';

const STORAGE_KEY = 'anuncios_sistema';

// Datos de ejemplo
const ANUNCIOS_DEMO: Anuncio[] = [
  {
    id: '1',
    titulo: 'Mantenimiento Bomba 3',
    descripcion: 'La bomba de combustible número 3 presenta una fuga menor en la manguera. Requiere revisión inmediata.',
    sector: 'Mantenimiento',
    prioridad: 'alta',
    estado: 'pendiente',
    fechaCreacion: new Date('2024-07-01T08:30:00'),
    fechaModificacion: new Date('2024-07-01T08:30:00'),
    creadoPor: 'Juan Pérez',
    comentarios: []
  },
  {
    id: '2',
    titulo: 'Promoción Fin de Semana',
    descripcion: 'Activar descuento del 10% en lavado premium para el fin de semana. Validar con todos los turnos.',
    sector: 'Tienda',
    prioridad: 'media',
    estado: 'en_proceso',
    fechaCreacion: new Date('2024-07-01T09:15:00'),
    fechaModificacion: new Date('2024-07-01T10:30:00'),
    creadoPor: 'Ana García',
    comentarios: [
      {
        id: '1',
        texto: 'Confirmado con turno mañana',
        autor: 'Ana García',
        fecha: new Date('2024-07-01T10:30:00')
      }
    ]
  },
  {
    id: '3',
    titulo: 'Restock Aceites',
    descripcion: 'Nivel bajo de aceites 10W40 y 5W30. Coordinar reposición urgente.',
    sector: 'Despacho',
    prioridad: 'alta',
    estado: 'completado',
    fechaCreacion: new Date('2024-06-30T14:20:00'),
    fechaModificacion: new Date('2024-07-01T07:45:00'),
    creadoPor: 'Admin Sistema',
    comentarios: [
      {
        id: '2',
        texto: 'Pedido realizado, llega mañana',
        autor: 'Juan Pérez',
        fecha: new Date('2024-07-01T07:45:00')
      }
    ]
  },
  {
    id: '4',
    titulo: 'Limpieza Profunda Área de Lavado',
    descripcion: 'Programar limpieza profunda del sistema de filtrado y drenaje del área de lavado.',
    sector: 'Lavadero',
    prioridad: 'baja',
    estado: 'pendiente',
    fechaCreacion: new Date('2024-07-01T11:00:00'),
    fechaModificacion: new Date('2024-07-01T11:00:00'),
    creadoPor: 'Admin Sistema',
    comentarios: []
  },
  {
    id: '5',
    titulo: 'Revisión Cierres de Caja',
    descripcion: 'Verificar inconsistencias en los cierres de caja del turno nocturno de la semana pasada.',
    sector: 'Administración',
    prioridad: 'media',
    estado: 'en_proceso',
    fechaCreacion: new Date('2024-07-01T06:30:00'),
    fechaModificacion: new Date('2024-07-01T08:00:00'),
    creadoPor: 'Admin Sistema',
    comentarios: []
  }
];

export const useAnuncios = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // Cargar anuncios desde localStorage
  const cargarAnuncios = useCallback(() => {
    try {
      const anunciosGuardados = localStorage.getItem(STORAGE_KEY);
      if (anunciosGuardados) {
        const parsed = JSON.parse(anunciosGuardados);
        // Convertir strings de fecha a objetos Date
        const anunciosConFechas = parsed.map((anuncio: any) => ({
          ...anuncio,
          fechaCreacion: new Date(anuncio.fechaCreacion),
          fechaModificacion: new Date(anuncio.fechaModificacion),
          comentarios: anuncio.comentarios.map((comentario: any) => ({
            ...comentario,
            fecha: new Date(comentario.fecha)
          }))
        }));
        setAnuncios(anunciosConFechas);
      } else {
        // Si no hay datos, usar los de demo
        setAnuncios(ANUNCIOS_DEMO);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ANUNCIOS_DEMO));
      }
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      setAnuncios(ANUNCIOS_DEMO);
    }
  }, []);

  // Guardar anuncios en localStorage
  const guardarAnuncios = useCallback((nuevosAnuncios: Anuncio[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosAnuncios));
      setAnuncios(nuevosAnuncios);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al guardar anuncios:', error);
    }
  }, []);

  // Crear nuevo anuncio
  const crearAnuncio = useCallback((nuevoAnuncio: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => {
    const anuncio: Anuncio = {
      ...nuevoAnuncio,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      comentarios: []
    };
    
    const nuevosAnuncios = [anuncio, ...anuncios];
    guardarAnuncios(nuevosAnuncios);
  }, [anuncios, guardarAnuncios]);

  // Actualizar anuncio
  const actualizarAnuncio = useCallback((id: string, cambios: Partial<Anuncio>) => {
    const nuevosAnuncios = anuncios.map(anuncio => 
      anuncio.id === id 
        ? { ...anuncio, ...cambios, fechaModificacion: new Date() }
        : anuncio
    );
    guardarAnuncios(nuevosAnuncios);
  }, [anuncios, guardarAnuncios]);

  // Cambiar estado de anuncio
  const cambiarEstado = useCallback((id: string, nuevoEstado: Anuncio['estado']) => {
    actualizarAnuncio(id, { estado: nuevoEstado });
  }, [actualizarAnuncio]);

  // Agregar comentario
  const agregarComentario = useCallback((idAnuncio: string, texto: string, autor: string) => {
    const anuncio = anuncios.find(a => a.id === idAnuncio);
    if (anuncio) {
      const nuevoComentario = {
        id: Date.now().toString(),
        texto,
        autor,
        fecha: new Date()
      };
      
      const comentariosActualizados = [...anuncio.comentarios, nuevoComentario];
      actualizarAnuncio(idAnuncio, { comentarios: comentariosActualizados });
    }
  }, [anuncios, actualizarAnuncio]);

  // Eliminar anuncio
  const eliminarAnuncio = useCallback((id: string) => {
    const nuevosAnuncios = anuncios.filter(anuncio => anuncio.id !== id);
    guardarAnuncios(nuevosAnuncios);
  }, [anuncios, guardarAnuncios]);

  // Filtrar anuncios
  const filtrarAnuncios = useCallback((filtros: FiltrosAnuncio) => {
    return anuncios.filter(anuncio => {
      const cumpleEstado = filtros.estado === 'todos' || anuncio.estado === filtros.estado;
      const cumpleSector = filtros.sector === 'todos' || anuncio.sector === filtros.sector;
      const cumplePrioridad = filtros.prioridad === 'todas' || anuncio.prioridad === filtros.prioridad;
      const cumpleBusqueda = filtros.textoBusqueda === '' || 
        anuncio.titulo.toLowerCase().includes(filtros.textoBusqueda.toLowerCase()) ||
        anuncio.descripcion.toLowerCase().includes(filtros.textoBusqueda.toLowerCase());
      
      return cumpleEstado && cumpleSector && cumplePrioridad && cumpleBusqueda;
    });
  }, [anuncios]);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(() => {
    const pendientes = anuncios.filter(a => a.estado === 'pendiente').length;
    const enProceso = anuncios.filter(a => a.estado === 'en_proceso').length;
    const completados = anuncios.filter(a => a.estado === 'completado').length;
    const urgentes = anuncios.filter(a => a.prioridad === 'alta' && a.estado !== 'completado').length;
    
    return { pendientes, enProceso, completados, urgentes, total: anuncios.length };
  }, [anuncios]);

  // Cargar anuncios al montar el componente
  useEffect(() => {
    cargarAnuncios();
  }, [cargarAnuncios]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarAnuncios();
    }, 30000);

    return () => clearInterval(interval);
  }, [cargarAnuncios]);

  return {
    anuncios,
    ultimaActualizacion,
    crearAnuncio,
    actualizarAnuncio,
    cambiarEstado,
    agregarComentario,
    eliminarAnuncio,
    filtrarAnuncios,
    obtenerEstadisticas,
    recargar: cargarAnuncios
  };
};
