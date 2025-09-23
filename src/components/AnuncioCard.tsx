import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Clock, CheckCircle, MoreVertical, Eye, MessageSquare, Edit, Trash2, Megaphone } from 'lucide-react';
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AnuncioCardProps {
  anuncio: Anuncio;
  onVerDetalle: (anuncio: Anuncio) => void;
  onCambiarEstado: (id: string, estado: Anuncio['estado']) => void;
  onEditar: (anuncio: Anuncio) => void;
  onEliminar: (id: string) => void;
  onAgregarComentario: (anuncio: Anuncio) => void;
}

export const AnuncioCard = ({
  anuncio,
  onVerDetalle,
  onCambiarEstado,
  onEditar,
  onEliminar,
  onAgregarComentario
}: AnuncioCardProps) => {
  const { usuario } = useAuth();
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);

  const getEstadoConfig = (estado: Anuncio['estado']) => {
    switch (estado) {
      case 'pendiente': return { color: 'text-gray-700', icon: Clock, texto: 'Pendiente' };
      case 'en_proceso': return { color: 'text-blue-700', icon: AlertTriangle, texto: 'En Proceso' };
      case 'completado': return { color: 'text-green-700', icon: CheckCircle, texto: 'Completado' };
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
  const estadoConfig = esTarea ? getEstadoConfig(anuncio.estado) : { color: 'text-purple-700', icon: Megaphone, texto: 'Anuncio' };
  const prioridadConfig = esTarea ? getPrioridadConfig(anuncio.prioridad) : null;
  const EstadoIcon = estadoConfig.icon;

  const formatearFecha = (fecha: Date) => fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const descripcionCorta = anuncio.descripcion.length > 150 ? `${anuncio.descripcion.substring(0, 150)}...` : anuncio.descripcion;

  const puedeEditar = usuario?.rol === 'admin' || (usuario?.rol === 'empleado' && anuncio.creadoPor === usuario.nombre);
  const puedeEliminar = usuario?.rol === 'admin';
  const puedeCambiarEstado = (usuario?.rol === 'admin' || usuario?.rol === 'empleado') && esTarea;
  const puedeComentar = usuario?.rol === 'admin' || 
                     (usuario?.rol === 'empleado' && usuario.sector && anuncio.sectores.includes(usuario.sector));

  const getProximoEstado = (estadoActual: Anuncio['estado']): Anuncio['estado'] | null => {
    if (!esTarea) return null;
    switch (estadoActual) {
      case 'pendiente': return 'en_proceso';
      case 'en_proceso': return 'completado';
      default: return null;
    }
  };

  const proximoEstado = getProximoEstado(anuncio.estado);
  const autorIniciales = anuncio.creadoPor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{autorIniciales}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{anuncio.creadoPor}</span>
            <span className="text-xs text-gray-500">{formatearFecha(anuncio.fechaCreacion)}</span>
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

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{anuncio.titulo}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {descripcionExpandida ? anuncio.descripcion : descripcionCorta}
          {anuncio.descripcion.length > 150 && (
            <button onClick={() => setDescripcionExpandida(!descripcionExpandida)} className="text-blue-600 hover:text-blue-700 ml-1 text-sm font-medium">
              {descripcionExpandida ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-2">
        {esTarea && prioridadConfig && (
          <Badge className={`${prioridadConfig.color} text-xs`}>{prioridadConfig.texto}</Badge>
        )}
        {anuncio.sectores.map(sector => (
          <Badge key={sector} variant="outline" className="text-xs">{sector}</Badge>
        ))}
        <div className={`flex items-center space-x-1 ${estadoConfig.color}`}>
          <EstadoIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{estadoConfig.texto}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {anuncio.comentarios.length > 0 && (
            <button onClick={() => onVerDetalle(anuncio)} className="flex items-center space-x-1 hover:text-blue-600">
              <MessageSquare className="h-4 w-4" />
              <span>{anuncio.comentarios.length} comentario{anuncio.comentarios.length > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
        <div className="flex items-stretch gap-2">
          {puedeCambiarEstado && proximoEstado && (
            <Button size="sm" onClick={() => onCambiarEstado(anuncio.id, proximoEstado)} className="flex-1 text-xs sm:text-sm">
              Marcar como {proximoEstado === 'en_proceso' ? 'En Proceso' : 'Completado'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onVerDetalle(anuncio)} className="flex-1 text-xs sm:text-sm">
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  );
};