
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { FiltrosAnuncio } from '@/types';

interface FiltrosSidebarProps {
  filtros: FiltrosAnuncio;
  onFiltrosChange: (filtros: FiltrosAnuncio) => void;
  onLimpiarFiltros: () => void;
}

export const FiltrosSidebar = ({ filtros, onFiltrosChange, onLimpiarFiltros }: FiltrosSidebarProps) => {
  const handleFiltroChange = (campo: keyof FiltrosAnuncio, valor: string) => {
    onFiltrosChange({ ...filtros, [campo]: valor });
  };

  const sectores = ['todos', 'Despacho', 'Tienda', 'Lavadero', 'Mantenimiento', 'Administración'];
  const estados = ['todos', 'pendiente', 'en_proceso', 'completado'];
  const prioridades = ['todas', 'alta', 'media', 'baja'];

  const tieneArtículosActivos = Object.values(filtros).some(valor => 
    valor !== 'todos' && valor !== 'todas' && valor !== ''
  );

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
          {tieneArtículosActivos && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLimpiarFiltros}
              className="flex items-center space-x-1 text-xs"
            >
              <X className="h-3 w-3" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div className="space-y-2">
          <Label htmlFor="busqueda" className="text-sm font-medium">
            Búsqueda
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="busqueda"
              placeholder="Buscar en título o descripción..."
              value={filtros.textoBusqueda}
              onChange={(e) => handleFiltroChange('textoBusqueda', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Estado</Label>
          <Select
            value={filtros.estado}
            onValueChange={(value) => handleFiltroChange('estado', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado === 'todos' ? 'Todos los estados' :
                   estado === 'pendiente' ? 'Pendiente' :
                   estado === 'en_proceso' ? 'En Proceso' :
                   'Completado'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sector</Label>
          <Select
            value={filtros.sector}
            onValueChange={(value) => handleFiltroChange('sector', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectores.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector === 'todos' ? 'Todos los sectores' : sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridad */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Prioridad</Label>
          <Select
            value={filtros.prioridad}
            onValueChange={(value) => handleFiltroChange('prioridad', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prioridades.map((prioridad) => (
                <SelectItem key={prioridad} value={prioridad}>
                  {prioridad === 'todas' ? 'Todas las prioridades' :
                   prioridad === 'alta' ? 'Alta' :
                   prioridad === 'media' ? 'Media' :
                   'Baja'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Indicadores visuales de filtros activos */}
        {tieneArtículosActivos && (
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500 mb-2">Filtros activos:</div>
            <div className="flex flex-wrap gap-1">
              {filtros.estado !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Estado: {filtros.estado === 'en_proceso' ? 'En Proceso' : 
                          filtros.estado.charAt(0).toUpperCase() + filtros.estado.slice(1)}
                </span>
              )}
              {filtros.sector !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {filtros.sector}
                </span>
              )}
              {filtros.prioridad !== 'todas' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Prioridad: {filtros.prioridad.charAt(0).toUpperCase() + filtros.prioridad.slice(1)}
                </span>
              )}
              {filtros.textoBusqueda && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  "{filtros.textoBusqueda}"
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
