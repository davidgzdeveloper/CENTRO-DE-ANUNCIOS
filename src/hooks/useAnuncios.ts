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
      console.log('📤 Enviando datos del anuncio:', nuevoAnuncioData);
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
        const errorData = await response.text();
        console.error('Error al crear anuncio:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error al crear anuncio:', error);
    }
  }, [fetchAnuncios]);

  // Actualizar anuncio usando la API con actualización optimista
  const actualizarAnuncio = useCallback(async (id: string, cambios: Partial<Anuncio>) => {
    // Actualización optimista - actualizar inmediatamente en la UI
    setAnuncios(prev => prev.map(anuncio =>
      anuncio.id === id
        ? { ...anuncio, ...cambios, fechaModificacion: new Date() }
        : anuncio
    ));

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

      if (!response.ok) {
        console.error('Error al actualizar anuncio:', response.status);
        // Si falla, revertir los cambios recargando desde el servidor
        await fetchAnuncios();
      }
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
      // Si falla, revertir los cambios recargando desde el servidor
      await fetchAnuncios();
    }
  }, [fetchAnuncios]);

  // Cambiar estado de anuncio
  const cambiarEstado = useCallback(async (id: string, nuevoEstado: Anuncio['estado']) => {
    await actualizarAnuncio(id, { estado: nuevoEstado });
  }, [actualizarAnuncio]);

  // Agregar comentario usando la API con actualización optimista
  const agregarComentario = useCallback(async (idAnuncio: string, texto: string, autor: string) => {
    // Actualización optimista - agregar comentario inmediatamente en la UI
    const nuevoComentario = {
      id: `temp-${Date.now()}`,
      texto,
      autor,
      fecha: new Date()
    };

    setAnuncios(prev => prev.map(anuncio =>
      anuncio.id === idAnuncio
        ? { ...anuncio, comentarios: [...anuncio.comentarios, nuevoComentario] }
        : anuncio
    ));

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
        // Refrescar solo para obtener el ID real del comentario desde el servidor
        await fetchAnuncios();
      } else {
        console.error('Error al agregar comentario:', response.status);
        // Si falla, revertir el comentario temporal
        setAnuncios(prev => prev.map(anuncio =>
          anuncio.id === idAnuncio
            ? { ...anuncio, comentarios: anuncio.comentarios.filter(c => c.id !== nuevoComentario.id) }
            : anuncio
        ));
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      // Si falla, revertir el comentario temporal
      setAnuncios(prev => prev.map(anuncio =>
        anuncio.id === idAnuncio
          ? { ...anuncio, comentarios: anuncio.comentarios.filter(c => c.id !== nuevoComentario.id) }
          : anuncio
      ));
    }
  }, [fetchAnuncios]);

  // Eliminar anuncio usando la API con actualización optimista
  const eliminarAnuncio = useCallback(async (id: string) => {
    // Guardar el anuncio por si necesitamos revertir
    const anuncioEliminado = anuncios.find(a => a.id === id);

    // Actualización optimista - eliminar inmediatamente de la UI
    setAnuncios(prev => prev.filter(anuncio => anuncio.id !== id));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/anuncios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error al eliminar anuncio:', response.status);
        // Si falla, restaurar el anuncio
        if (anuncioEliminado) {
          setAnuncios(prev => [...prev, anuncioEliminado].sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()));
        }
      }
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      // Si falla, restaurar el anuncio
      if (anuncioEliminado) {
        setAnuncios(prev => [...prev, anuncioEliminado].sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()));
      }
    }
  }, [anuncios]);

  // Filtrar anuncios (en memoria, después de obtenerlos de la BD)
  const filtrarAnuncios = useCallback((filtros: FiltrosAnuncio) => {
    if (!usuario) return [];

    let sectoresVisiblesPorUsuario: string[];
    if (usuario.rol === 'admin') {
      sectoresVisiblesPorUsuario = ['Playa', 'Tienda', 'Depósito', 'Mantenimiento'];
    } else if (usuario.sector) {
      sectoresVisiblesPorUsuario = [usuario.sector];
    } else {
      // Fallback for users without a sector, although this should not happen with the new changes
      sectoresVisiblesPorUsuario = [];
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