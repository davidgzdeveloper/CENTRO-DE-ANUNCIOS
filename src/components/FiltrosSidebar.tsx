
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
  tipoVista: 'tareas' | 'pizarra'; // Nueva prop
}

export const FiltrosSidebar = ({ filtros, onFiltrosChange, onLimpiarFiltros, tipoVista }: FiltrosSidebarProps) => {
  const handleFiltroChange = (campo: keyof FiltrosAnuncio, valor: string) => {
    onFiltrosChange({ ...filtros, [campo]: valor });
  };

  const sectores = ['todos', 'Playa', 'Tienda', 'Depósito', 'Mantenimiento'];
  const estados = ['todos', 'pendiente', 'en_proceso', 'completado'];
  const prioridades = ['todas', 'alta', 'media', 'baja'];

  const tieneArticulosActivos = Object.entries(filtros).some(([key, valor]) => {
    if (tipoVista === 'pizarra' && (key === 'estado' || key === 'prioridad')) {
      return false;
    }
    return valor !== 'todos' && valor !== 'todas' && valor !== '';
  });

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
          {tieneArticulosActivos && (
            <Button variant="outline" size="sm" onClick={onLimpiarFiltros} className="flex items-center space-x-1 text-xs">
              <X className="h-3 w-3" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="busqueda">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="busqueda" placeholder="Buscar..." value={filtros.textoBusqueda} onChange={(e) => handleFiltroChange('textoBusqueda', e.target.value)} className="pl-10" />
          </div>
        </div>

        {tipoVista === 'tareas' && (
          <>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtros.estado} onValueChange={(value) => handleFiltroChange('estado', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estados.map(e => <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={filtros.prioridad} onValueChange={(value) => handleFiltroChange('prioridad', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {prioridades.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Sector</Label>
          <Select value={filtros.sector} onValueChange={(value) => handleFiltroChange('sector', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {sectores.map(s => <SelectItem key={s} value={s}>{s === 'todos' ? 'Todos los sectores' : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
