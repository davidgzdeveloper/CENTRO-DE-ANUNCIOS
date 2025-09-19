import { useState, useEffect, useCallback } from 'react';

interface Cotizacion {
  dolar: number;
  dolarViejo: number;
  real: number;
  fechaActualizacion: Date;
  actualizadoPor: string;
}

export const useCotizaciones = () => {
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener cotizaciones actuales
  const fetchCotizaciones = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cotizaciones`);

      if (response.ok) {
        const data = await response.json();
        setCotizacion({
          ...data,
          fechaActualizacion: new Date(data.fechaActualizacion)
        });
      } else {
        console.error('Error al obtener cotizaciones:', response.status);
        setCotizacion(null);
      }
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      setCotizacion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  // Actualizar cotizaciones (solo admin)
  const actualizarCotizaciones = useCallback(async (
    nuevasCotizaciones: { dolar: number; dolarViejo: number; real: number },
    nombreUsuario: string
  ) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...nuevasCotizaciones,
          actualizadoPor: nombreUsuario
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCotizacion({
          ...data,
          fechaActualizacion: new Date(data.fechaActualizacion)
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar cotizaciones');
      }
    } catch (error) {
      console.error('Error al actualizar cotizaciones:', error);
      throw error;
    }
  }, []);

  return {
    cotizacion,
    loading,
    actualizarCotizaciones,
    refrescarCotizaciones: fetchCotizaciones
  };
};