
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface FormularioAnuncioProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (anuncio: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => void;
  anuncioEditar?: Anuncio | null;
  onActualizar?: (id: string, cambios: Partial<Anuncio>) => void;
}

export const FormularioAnuncio = ({ 
  abierto, 
  onCerrar, 
  onGuardar, 
  anuncioEditar, 
  onActualizar 
}: FormularioAnuncioProps) => {
  const { usuario } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    sector: '' as Anuncio['sector'] | '',
    prioridad: '' as Anuncio['prioridad'] | '',
    estado: 'pendiente' as Anuncio['estado']
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const sectores: Anuncio['sector'][] = ['Despacho', 'Tienda', 'Lavadero', 'Mantenimiento', 'Administración'];
  const prioridades: Anuncio['prioridad'][] = ['alta', 'media', 'baja'];
  const estados: Anuncio['estado'][] = ['pendiente', 'en_proceso', 'completado'];

  useEffect(() => {
    if (anuncioEditar) {
      setFormData({
        titulo: anuncioEditar.titulo,
        descripcion: anuncioEditar.descripcion,
        sector: anuncioEditar.sector,
        prioridad: anuncioEditar.prioridad,
        estado: anuncioEditar.estado
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        sector: '',
        prioridad: '',
        estado: 'pendiente'
      });
    }
    setErrores([]);
  }, [anuncioEditar, abierto]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: string[] = [];

    if (!formData.titulo.trim()) {
      nuevosErrores.push('El título es obligatorio');
    } else if (formData.titulo.trim().length < 5) {
      nuevosErrores.push('El título debe tener al menos 5 caracteres');
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es obligatoria');
    } else if (formData.descripcion.trim().length < 10) {
      nuevosErrores.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!formData.sector) {
      nuevosErrores.push('Debe seleccionar un sector');
    }

    if (!formData.prioridad) {
      nuevosErrores.push('Debe seleccionar una prioridad');
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      if (anuncioEditar && onActualizar) {
        // Actualizar anuncio existente
        onActualizar(anuncioEditar.id, {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          sector: formData.sector as Anuncio['sector'],
          prioridad: formData.prioridad as Anuncio['prioridad'],
          estado: formData.estado
        });
      } else {
        // Crear nuevo anuncio
        onGuardar({
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          sector: formData.sector as Anuncio['sector'],
          prioridad: formData.prioridad as Anuncio['prioridad'],
          estado: formData.estado,
          creadoPor: usuario?.nombre || 'Usuario Desconocido'
        });
      }
      
      onCerrar();
    } catch (error) {
      console.error('Error al guardar anuncio:', error);
      setErrores(['Error al guardar el anuncio. Intente nuevamente.']);
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (campo: keyof typeof formData, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {anuncioEditar ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errores.length > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errores.map((error, index) => (
                    <li key={index} className="text-red-700">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="titulo" className="text-sm font-medium">
                Título del Anuncio *
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ingrese el título del anuncio"
                disabled={guardando}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.titulo.length}/100 caracteres
              </div>
            </div>

            <div>
              <Label htmlFor="sector" className="text-sm font-medium">
                Sector *
              </Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleInputChange('sector', value)}
                disabled={guardando}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectores.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridad" className="text-sm font-medium">
                Prioridad *
              </Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) => handleInputChange('prioridad', value)}
                disabled={guardando}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="media">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="baja">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Baja
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {anuncioEditar && (
              <div className="md:col-span-2">
                <Label htmlFor="estado" className="text-sm font-medium">
                  Estado
                </Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange('estado', value as Anuncio['estado'])}
                  disabled={guardando}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado === 'pendiente' ? 'Pendiente' :
                         estado === 'en_proceso' ? 'En Proceso' :
                         'Completado'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción *
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describa detalladamente el anuncio, incluya toda la información relevante..."
              rows={6}
              disabled={guardando}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.descripcion.length}/1000 caracteres
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCerrar}
              disabled={guardando}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={guardando}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {guardando ? 'Guardando...' : anuncioEditar ? 'Actualizar' : 'Crear Anuncio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
