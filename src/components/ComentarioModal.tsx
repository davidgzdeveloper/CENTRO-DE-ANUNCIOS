
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare } from 'lucide-react';
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ComentarioModalProps {
  anuncio: Anuncio | null;
  abierto: boolean;
  onCerrar: () => void;
  onAgregarComentario: (idAnuncio: string, texto: string, autor: string) => void;
}

export const ComentarioModal = ({ anuncio, abierto, onCerrar, onAgregarComentario }: ComentarioModalProps) => {
  const { usuario } = useAuth();
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!anuncio) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comentario.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    if (comentario.trim().length < 5) {
      setError('El comentario debe tener al menos 5 caracteres');
      return;
    }

    if (!usuario) {
      setError('Usuario no autenticado');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      onAgregarComentario(anuncio.id, comentario.trim(), usuario.nombre);
      setComentario('');
      onCerrar();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      setError('Error al agregar el comentario. Intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCerrar = () => {
    setComentario('');
    setError('');
    onCerrar();
  };

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Agregar Comentario</span>
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <strong>Anuncio:</strong> {anuncio.titulo.length > 50 
              ? anuncio.titulo.substring(0, 50) + '...' 
              : anuncio.titulo}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Textarea
                value={comentario}
                onChange={(e) => {
                  setComentario(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Escriba su comentario sobre este anuncio..."
                rows={5}
                disabled={enviando}
                maxLength={500}
                className="resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {comentario.length}/500 caracteres
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Comentando como:</strong> {usuario?.nombre}
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCerrar}
              disabled={enviando}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!comentario.trim() || enviando}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {enviando ? 'Enviando...' : 'Agregar Comentario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
