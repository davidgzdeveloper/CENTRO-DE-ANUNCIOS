import React from 'react';
import { DollarSign, TrendingUp, Clock, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Cotizacion {
  dolar: number;
  dolarViejo: number;
  real: number;
  fechaActualizacion: Date;
  actualizadoPor: string;
}

interface CartelCotizacionProps {
  cotizacion: Cotizacion | null;
  loading: boolean;
  esAdmin: boolean;
  onEditarCotizaciones: () => void;
}

export const CartelCotizacion = ({
  cotizacion,
  loading,
  esAdmin,
  onEditarCotizaciones
}: CartelCotizacionProps) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center space-x-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-lg font-semibold">Cargando cotizaciones...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6" />
              <span className="text-lg font-semibold">Cotizaciones no disponibles</span>
            </div>
            {esAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditarCotizaciones}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const fechaFormateada = new Date(cotizacion.fechaActualizacion).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg border-b-4 border-emerald-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Cotizaciones principales */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-lg font-semibold">Cotizaciones</span>
            </div>

            {/* Dólar destacado */}
            <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-green-100">USD</span>
                <span className="text-xl font-bold text-white">
                  ${cotizacion.dolar.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Otras cotizaciones */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs text-green-200 uppercase font-medium">USD Viejo</div>
                <div className="text-lg font-semibold">${cotizacion.dolarViejo.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-200 uppercase font-medium">Real</div>
                <div className="text-lg font-semibold">${cotizacion.real.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Información de actualización y botón admin */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-green-100">
              <Clock className="h-4 w-4" />
              <div className="text-right">
                <div>Actualizado: {fechaFormateada}</div>
                <div className="text-xs">por {cotizacion.actualizadoPor}</div>
              </div>
            </div>

            {esAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditarCotizaciones}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Vista móvil - cotizaciones adicionales */}
        <div className="sm:hidden mt-3 flex justify-center space-x-6">
          <div className="text-center">
            <div className="text-xs text-green-200 uppercase font-medium">USD Viejo</div>
            <div className="text-base font-semibold">${cotizacion.dolarViejo.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-green-200 uppercase font-medium">Real</div>
            <div className="text-base font-semibold">${cotizacion.real.toFixed(2)}</div>
          </div>
        </div>

        {/* Vista móvil - información de actualización */}
        <div className="md:hidden mt-2 text-center">
          <div className="text-xs text-green-100">
            Actualizado: {fechaFormateada} por {cotizacion.actualizadoPor}
          </div>
        </div>
      </div>
    </div>
  );
};