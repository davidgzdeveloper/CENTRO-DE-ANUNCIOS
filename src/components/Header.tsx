
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, User, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnuncios } from '@/hooks/useAnuncios';

interface HeaderProps {
  onNuevoAnuncio: () => void;
}

export const Header = ({ onNuevoAnuncio }: HeaderProps) => {
  const { usuario, logout } = useAuth();
  const { obtenerEstadisticas, ultimaActualizacion, recargar } = useAnuncios();
  const estadisticas = obtenerEstadisticas();

  const formatearHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Monitor de Anuncios</h1>
            <p className="text-sm text-gray-600">Estación de Servicios - Sistema Interno</p>
          </div>
          
          {estadisticas.urgentes > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
              <Bell className="h-4 w-4 text-red-600" />
              <Badge variant="destructive" className="text-xs">
                {estadisticas.urgentes} Urgente{estadisticas.urgentes > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Última actualización: {formatearHora(ultimaActualizacion)}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={recargar}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>

          {usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado') && (
            <Button
              onClick={onNuevoAnuncio}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Anuncio</span>
            </Button>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{usuario?.nombre}</span>
            <Badge variant="outline" className="text-xs">
              {usuario?.rol.charAt(0).toUpperCase() + usuario?.rol.slice(1)}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span>Pendientes: {estadisticas.pendientes}</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>En Proceso: {estadisticas.enProceso}</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Completados: {estadisticas.completados}</span>
        </div>
        <div className="text-gray-500">
          Total: {estadisticas.total} anuncios
        </div>
      </div>
    </header>
  );
};
