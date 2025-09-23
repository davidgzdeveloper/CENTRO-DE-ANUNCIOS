import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Clock, CheckCircle, MoreVertical, Eye, MessageSquare, Edit, Trash2, Megaphone } from 'lucide-react';
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AnuncioTareaCardProps {
  anuncio: Anuncio;
  onVerDetalle: (anuncio: Anuncio) => void;
  onCambiarEstado: (id: string, estado: Anuncio['estado']) => void;
  onEditar: (anuncio: Anuncio) => void;
  onEliminar: (id: string) => void;
  onAgregarComentario: (anuncio: Anuncio) => void;
}

export const AnuncioTareaCard = ({ 
  anuncio, 
  onVerDetalle, 
  onCambiarEstado, 
  onEditar, 
  onEliminar,
  onAgregarComentario 
}: AnuncioTareaCardProps) => {
  const { usuario } = useAuth();
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);

  const getEstadoConfig = (estado: Anuncio['estado']) => {
    switch (estado) {
      case 'pendiente': return { color: 'bg-gray-100 border-gray-300 text-gray-700', icon: Clock, texto: 'Pendiente' };
      case 'en_proceso': return { color: 'bg-blue-50 border-blue-300 text-blue-700', icon: AlertTriangle, texto: 'En Proceso' };
      case 'completado': return { color: 'bg-green-50 border-green-300 text-green-700', icon: CheckCircle, texto: 'Completado' };
    }
  };

  const getPrioridadConfig = (prioridad: Anuncio['prioridad']) => {
    switch (prioridad) {
      case 'alta': return { color: 'bg-red-100 text-red-800 border-red-200', texto: 'Alta' };
      case 'media': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', texto: 'Media' };
      case 'baja': return { color: 'bg-green-100 text-green-800 border-green-200', texto: 'Baja' };
    }
  };

  const esTarea = anuncio.tipo === 'tarea';
  const estadoConfig = esTarea ? getEstadoConfig(anuncio.estado) : { color: 'bg-purple-50 border-purple-300 text-purple-700', icon: Megaphone, texto: 'Anuncio' };
  const prioridadConfig = esTarea ? getPrioridadConfig(anuncio.prioridad) : null;
  const EstadoIcon = estadoConfig.icon;

  const formatearFecha = (fecha: Date) => fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const descripcionCorta = anuncio.descripcion.length > 120 ? `${anuncio.descripcion.substring(0, 120)}...` : anuncio.descripcion;

  const puedeEditar = usuario?.rol === 'admin' || (usuario?.rol === 'empleado' && anuncio.creadoPor === usuario.nombre);
  const puedeEliminar = usuario?.rol === 'admin';
  const puedeCambiarEstado = (usuario?.rol === 'admin' || usuario?.rol === 'empleado') && esTarea;
  const puedeComentar = usuario?.rol === 'admin' || usuario?.rol === 'empleado';

  const getProximoEstado = (estadoActual: Anuncio['estado']): Anuncio['estado'] | null => {
    if (!esTarea) return null;
    switch (estadoActual) {
      case 'pendiente': return 'en_proceso';
      case 'en_proceso': return 'completado';
      default: return null;
    }
  };

  const proximoEstado = getProximoEstado(anuncio.estado);

  return (
    <Card className={`${estadoConfig.color} border-2 hover:shadow-lg transition-shadow duration-200 flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 leading-tight">{anuncio.titulo}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {esTarea && prioridadConfig && (
                <Badge className={`${prioridadConfig.color} text-xs`}>{prioridadConfig.texto}</Badge>
              )}
              {anuncio.sectores.map(sector => (
                <Badge key={sector} variant="outline" className="text-xs">{sector}</Badge>
              ))}
              <div className="flex items-center space-x-1">
                <EstadoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">{estadoConfig.texto}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onVerDetalle(anuncio)}><Eye className="h-4 w-4 mr-2" />Ver detalles</DropdownMenuItem>
              {puedeComentar && <DropdownMenuItem onClick={() => onAgregarComentario(anuncio)}><MessageSquare className="h-4 w-4 mr-2" />Agregar comentario</DropdownMenuItem>}
              {puedeEditar && <DropdownMenuItem onClick={() => onEditar(anuncio)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>}
              {puedeEliminar && <DropdownMenuItem onClick={() => onEliminar(anuncio.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            {descripcionExpandida ? anuncio.descripcion : descripcionCorta}
            {anuncio.descripcion.length > 120 && (
              <button onClick={() => setDescripcionExpandida(!descripcionExpandida)} className="text-blue-600 hover:text-blue-700 ml-1 text-sm font-medium">
                {descripcionExpandida ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-4 space-y-1 sm:space-y-0">
            <div><span className="font-medium">Creado por:</span> {anuncio.creadoPor}</div>
            <div>{formatearFecha(anuncio.fechaCreacion)}</div>
          </div>
          {anuncio.comentarios.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-600 mb-4">
              <MessageSquare className="h-3 w-3" />
              <span>{anuncio.comentarios.length} comentario{anuncio.comentarios.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-stretch space-y-2 mt-auto">
          {puedeCambiarEstado && proximoEstado && (
            <Button size="sm" onClick={() => onCambiarEstado(anuncio.id, proximoEstado)} className="text-xs sm:text-sm">
              Marcar como {proximoEstado === 'en_proceso' ? 'En Proceso' : 'Completado'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onVerDetalle(anuncio)} className="text-xs sm:text-sm">
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};