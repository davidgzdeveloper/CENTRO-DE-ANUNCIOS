import { useState, useEffect, useCallback } from 'react';
import { Anuncio, FiltrosAnuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useAnuncios = () => {
  const { usuario } = useAuth();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

  // Obtener todos los anuncios desde la API
  const fetchAnuncios = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const anunciosData = await response.json();
        const anunciosConFechas = anunciosData.map((anuncio: any) => ({
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
        console.error('Error al obtener anuncios:', response.status);
        setAnuncios([]);
      }
    } catch (error) {
      console.error('Error al obtener anuncios:', error);
      setAnuncios([]);
    }
  }, []);

  useEffect(() => {
    fetchAnuncios();
  }, [fetchAnuncios]);

  // Crear anuncio usando la API
  const crearAnuncio = useCallback(async (nuevoAnuncioData: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoAnuncioData)
      });

      if (response.ok) {
        await fetchAnuncios();
      } else {
        console.error('Error al crear anuncio:', response.status);
      }
    } catch (error) {
      console.error('Error al crear anuncio:', error);
    }
  }, [fetchAnuncios]);

  // Actualizar anuncio usando la API
  const actualizarAnuncio = useCallback(async (id: string, cambios: Partial<Anuncio>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cambios)
      });

      if (response.ok) {
        await fetchAnuncios();
      } else {
        console.error('Error al actualizar anuncio:', response.status);
      }
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
    }
  }, [fetchAnuncios]);

  // Cambiar estado de anuncio
  const cambiarEstado = useCallback(async (id: string, nuevoEstado: Anuncio['estado']) => {
    await actualizarAnuncio(id, { estado: nuevoEstado });
  }, [actualizarAnuncio]);

  // Agregar comentario usando la API
  const agregarComentario = useCallback(async (idAnuncio: string, texto: string, autor: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios/${idAnuncio}/comentarios`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto, autor })
      });

      if (response.ok) {
        await fetchAnuncios();
      } else {
        console.error('Error al agregar comentario:', response.status);
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  }, [fetchAnuncios]);

  // Eliminar anuncio usando la API
  const eliminarAnuncio = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAnuncios();
      } else {
        console.error('Error al eliminar anuncio:', response.status);
      }
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
    }
  }, [fetchAnuncios]);

  // Filtrar anuncios (en memoria, después de obtenerlos de la BD)
  const filtrarAnuncios = useCallback((filtros: FiltrosAnuncio) => {
    if (!usuario) return [];

    let sectoresVisiblesPorUsuario: string[];
    if (usuario.rol === 'admin') {
      sectoresVisiblesPorUsuario = ['Playa', 'Tienda', 'Depósito', 'Mantenimiento'];
    } else {
      const sectorDelUsuario = usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1);
      sectoresVisiblesPorUsuario = [sectorDelUsuario];
    }

    return anuncios.filter(anuncio => {
      const esVisibleParaUsuario = anuncio.sectores.some(s => sectoresVisiblesPorUsuario.includes(s));
      if (!esVisibleParaUsuario) return false;

      const cumpleSectorFiltro = filtros.sector === 'todos' || anuncio.sectores.includes(filtros.sector);
      const cumpleBusqueda = filtros.textoBusqueda === '' || 
        anuncio.titulo.toLowerCase().includes(filtros.textoBusqueda.toLowerCase()) ||
        anuncio.descripcion.toLowerCase().includes(filtros.textoBusqueda.toLowerCase());

      if (anuncio.tipo === 'tarea') {
        const cumpleEstado = filtros.estado === 'todos' || anuncio.estado === filtros.estado;
        const cumplePrioridad = filtros.prioridad === 'todas' || anuncio.prioridad === filtros.prioridad;
        return cumpleSectorFiltro && cumpleBusqueda && cumpleEstado && cumplePrioridad;
      }
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