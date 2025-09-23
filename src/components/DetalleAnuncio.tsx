
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface DetalleAnuncioProps {
  anuncio: Anuncio | null;
  abierto: boolean;
  onCerrar: () => void;
  onAgregarComentario: (idAnuncio: string, texto: string, autor: string) => void;
}

export const DetalleAnuncio = ({ anuncio, abierto, onCerrar, onAgregarComentario }: DetalleAnuncioProps) => {
  const { usuario } = useAuth();
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  if (!anuncio) return null;

  const getEstadoConfig = (estado: Anuncio['estado']) => {
    switch (estado) {
      case 'pendiente':
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: Clock,
          texto: 'Pendiente'
        };
      case 'en_proceso':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: AlertTriangle,
          texto: 'En Proceso'
        };
      case 'completado':
        return {
          color: 'bg-green-100 text-green-700 border-green-300',
          icon: CheckCircle,
          texto: 'Completado'
        };
    }
  };

  const getPrioridadConfig = (prioridad: Anuncio['prioridad']) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'bg-red-100 text-red-800 border-red-200', texto: 'Alta Prioridad' };
      case 'media':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', texto: 'Prioridad Media' };
      case 'baja':
        return { color: 'bg-green-100 text-green-800 border-green-200', texto: 'Baja Prioridad' };
    }
  };

  const estadoConfig = getEstadoConfig(anuncio.estado);
  const prioridadConfig = getPrioridadConfig(anuncio.prioridad);
  const EstadoIcon = estadoConfig.icon;

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() || !usuario) return;

    setEnviandoComentario(true);
    try {
      onAgregarComentario(anuncio.id, nuevoComentario.trim(), usuario.nombre);
      setNuevoComentario('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const puedeComentear = usuario?.rol === 'admin' || usuario?.rol === 'empleado';

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-3 leading-tight">
                {anuncio.titulo}
              </DialogTitle>
              <div className="flex items-center space-x-3">
                <Badge className={`${estadoConfig.color} flex items-center space-x-1 px-3 py-1`}>
                  <EstadoIcon className="h-4 w-4" />
                  <span>{estadoConfig.texto}</span>
                </Badge>
                <Badge className={`${prioridadConfig.color} px-3 py-1`}>
                  {prioridadConfig.texto}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {anuncio.sectores}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Información del Anuncio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Creado por:</span>
                    <p className="text-gray-900">{anuncio.creadoPor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha de creación:</span>
                    <p className="text-gray-900">{formatearFecha(anuncio.fechaCreacion)}</p>
                  </div>
                  {anuncio.fechaModificacion.getTime() > anuncio.fechaCreacion.getTime() && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Última modificación:</span>
                      <p className="text-gray-900">{formatearFecha(anuncio.fechaModificacion)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Descripción</h3>
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {anuncio.descripcion}
                  </p>
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Comentarios ({anuncio.comentarios.length})</span>
                </h3>

                {anuncio.comentarios.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay comentarios aún</p>
                    {puedeComentear && <p className="text-sm">Sé el primero en comentar</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {anuncio.comentarios.map((comentario) => (
                      <div key={comentario.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{comentario.autor}</span>
                          <span className="text-sm text-gray-500">
                            {formatearFechaCorta(comentario.fecha)}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comentario.texto}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para agregar comentario */}
                {puedeComentear && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Agregar comentario</h4>
                    <div className="space-y-3">
                      <Textarea
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Escriba su comentario aquí..."
                        rows={3}
                        disabled={enviandoComentario}
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {nuevoComentario.length}/500 caracteres
                        </span>
                        <Button
                          onClick={handleEnviarComentario}
                          disabled={!nuevoComentario.trim() || enviandoComentario}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>{enviandoComentario ? 'Enviando...' : 'Enviar'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <Separator className="my-4" />

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
