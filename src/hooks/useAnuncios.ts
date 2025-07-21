import { useState, useEffect, useCallback } from 'react';
import { Anuncio, FiltrosAnuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'anuncios_sistema_v2'; // Nueva key para evitar conflictos con datos viejos

// Datos de ejemplo actualizados
const ANUNCIOS_DEMO: Anuncio[] = [
  // Tareas
  { id: '1', tipo: 'tarea', titulo: 'Mantenimiento Bomba 3', descripcion: 'Fuga menor en manguera. Revisión inmediata.', sectores: ['Mantenimiento', 'Playa'], prioridad: 'alta', estado: 'pendiente', fechaCreacion: new Date('2024-07-20T08:30:00'), fechaModificacion: new Date(), creadoPor: 'admin', comentarios: [] },
  { id: '2', tipo: 'tarea', titulo: 'Promoción Fin de Semana', descripcion: 'Activar 10% de descuento en lavado premium.', sectores: ['Tienda'], prioridad: 'media', estado: 'en_proceso', fechaCreacion: new Date('2024-07-20T09:15:00'), fechaModificacion: new Date(), creadoPor: 'tienda', comentarios: [] },
  { id: '3', tipo: 'tarea', titulo: 'Restock Aceites', descripcion: 'Nivel bajo de 10W40 y 5W30. Reposición urgente.', sectores: ['Depósito', 'Tienda'], prioridad: 'alta', estado: 'completado', fechaCreacion: new Date('2024-07-19T14:00:00'), fechaModificacion: new Date(), creadoPor: 'deposito', comentarios: [] },
  
  // Pizarra
  { id: '4', tipo: 'pizarra', titulo: 'NUEVO HORARIO DE VERANO', descripcion: 'A partir del 1 de Agosto, el horario de atención será de 7:00 a 22:00 hs.', sectores: ['Playa', 'Tienda', 'Depósito', 'Mantenimiento'], prioridad: 'baja', estado: 'pendiente', fechaCreacion: new Date('2024-07-18T10:00:00'), fechaModificacion: new Date(), creadoPor: 'admin', comentarios: [] },
  { id: '5', tipo: 'pizarra', titulo: 'Protocolo de Seguridad', descripcion: 'Recordatorio: El uso de calzado de seguridad es obligatorio en el área de Depósito y Mantenimiento.', sectores: ['Depósito', 'Mantenimiento'], prioridad: 'media', estado: 'pendiente', fechaCreacion: new Date('2024-07-17T11:00:00'), fechaModificacion: new Date(), creadoPor: 'admin', comentarios: [] },
];

export const useAnuncios = () => {
  const { usuario } = useAuth();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

  const guardarAnuncios = useCallback((nuevosAnuncios: Anuncio[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosAnuncios));
      setAnuncios(nuevosAnuncios);
    } catch (error) {
      console.error('Error al guardar anuncios:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const anunciosGuardados = localStorage.getItem(STORAGE_KEY);
      if (anunciosGuardados) {
        const parsed = JSON.parse(anunciosGuardados);
        const anunciosConFechas = parsed.map((anuncio: any) => ({
          ...anuncio,
          fechaCreacion: new Date(anuncio.fechaCreacion),
          fechaModificacion: new Date(anuncio.fechaModificacion),
          comentarios: anuncio.comentarios.map((c: any) => ({ ...c, fecha: new Date(c.fecha) }))
        }));
        setAnuncios(anunciosConFechas);
      } else {
        setAnuncios(ANUNCIOS_DEMO);
        guardarAnuncios(ANUNCIOS_DEMO);
      }
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      setAnuncios(ANUNCIOS_DEMO);
    }
  }, [guardarAnuncios]);

  const crearAnuncio = useCallback((nuevoAnuncioData: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => {
    const anuncioCompleto: Anuncio = {
      ...nuevoAnuncioData,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      comentarios: [],
      // Asegurarse que los campos por defecto de 'tarea' estén correctos
      estado: nuevoAnuncioData.tipo === 'pizarra' ? 'pendiente' : nuevoAnuncioData.estado,
      prioridad: nuevoAnuncioData.tipo === 'pizarra' ? 'baja' : nuevoAnuncioData.prioridad,
    };
    guardarAnuncios([anuncioCompleto, ...anuncios]);
  }, [anuncios, guardarAnuncios]);

  const actualizarAnuncio = useCallback((id: string, cambios: Partial<Anuncio>) => {
    const nuevosAnuncios = anuncios.map(anuncio => 
      anuncio.id === id 
        ? { ...anuncio, ...cambios, fechaModificacion: new Date() }
        : anuncio
    );
    guardarAnuncios(nuevosAnuncios);
  }, [anuncios, guardarAnuncios]);

  const cambiarEstado = useCallback((id: string, nuevoEstado: Anuncio['estado']) => {
    actualizarAnuncio(id, { estado: nuevoEstado });
  }, [actualizarAnuncio]);

  const agregarComentario = useCallback((idAnuncio: string, texto: string, autor: string) => {
    const anuncio = anuncios.find(a => a.id === idAnuncio);
    if (anuncio) {
      const nuevoComentario = { id: Date.now().toString(), texto, autor, fecha: new Date() };
      actualizarAnuncio(idAnuncio, { comentarios: [...anuncio.comentarios, nuevoComentario] });
    }
  }, [anuncios, actualizarAnuncio]);

  const eliminarAnuncio = useCallback((id: string) => {
    guardarAnuncios(anuncios.filter(anuncio => anuncio.id !== id));
  }, [anuncios, guardarAnuncios]);

  const filtrarAnuncios = useCallback((filtros: FiltrosAnuncio) => {
    if (!usuario) return [];

    // Lógica corregida para determinar los sectores visibles por el usuario
    let sectoresVisiblesPorUsuario: string[];
    if (usuario.rol === 'admin') {
      sectoresVisiblesPorUsuario = ['Playa', 'Tienda', 'Depósito', 'Mantenimiento'];
    } else {
      // Capitaliza el nombre del usuario para que coincida con el formato del sector (ej: 'playa' -> 'Playa')
      const sectorDelUsuario = usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1);
      sectoresVisiblesPorUsuario = [sectorDelUsuario];
    }

    return anuncios.filter(anuncio => {
      // 1. Filtro por visibilidad del usuario (sector)
      const esVisibleParaUsuario = anuncio.sectores.some(s => sectoresVisiblesPorUsuario.includes(s));
      if (!esVisibleParaUsuario) return false;

      // 2. Filtros de la UI
      const cumpleSectorFiltro = filtros.sector === 'todos' || anuncio.sectores.includes(filtros.sector);
      const cumpleBusqueda = filtros.textoBusqueda === '' || 
        anuncio.titulo.toLowerCase().includes(filtros.textoBusqueda.toLowerCase()) ||
        anuncio.descripcion.toLowerCase().includes(filtros.textoBusqueda.toLowerCase());

      // 3. Filtros específicos para TAREAS
      if (anuncio.tipo === 'tarea') {
        const cumpleEstado = filtros.estado === 'todos' || anuncio.estado === filtros.estado;
        const cumplePrioridad = filtros.prioridad === 'todas' || anuncio.prioridad === filtros.prioridad;
        return cumpleSectorFiltro && cumpleBusqueda && cumpleEstado && cumplePrioridad;
      }

      // Para Pizarra, solo aplican los filtros generales
      return cumpleSectorFiltro && cumpleBusqueda;
    });
  }, [anuncios, usuario]);

  return {
    anuncios,
    crearAnuncio,
    actualizarAnuncio,
    cambiarEstado,
    agregarComentario,
    eliminarAnuncio,
    filtrarAnuncios,
  };
};