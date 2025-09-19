import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Anuncio } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface FormularioAnuncioProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (anuncio: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => void;
  anuncioEditar?: Anuncio | null;
  onActualizar?: (id: string, cambios: Partial<Anuncio>) => void;
}

const SECTORES_DISPONIBLES = ['Playa', 'Tienda', 'Depósito', 'Mantenimiento'];

export const FormularioAnuncio = ({ 
  abierto, 
  onCerrar, 
  onGuardar, 
  anuncioEditar, 
  onActualizar 
}: FormularioAnuncioProps) => {
  const { usuario } = useAuth();
  const [tipo, setTipo] = useState<Anuncio['tipo']>('tarea');
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: '' as Anuncio['prioridad'] | '',
    estado: 'pendiente' as Anuncio['estado']
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (anuncioEditar) {
      setTipo(anuncioEditar.tipo);
      setSectoresSeleccionados(anuncioEditar.sectores);
      setFormData({
        titulo: anuncioEditar.titulo,
        descripcion: anuncioEditar.descripcion,
        prioridad: anuncioEditar.prioridad,
        estado: anuncioEditar.estado
      });
    } else {
      // Reset a valores por defecto para un nuevo formulario
      setTipo('tarea');
      setSectoresSeleccionados([]);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: '',
        estado: 'pendiente'
      });
    }
    setErrores([]);
  }, [anuncioEditar, abierto]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: string[] = [];
    if (!formData.titulo.trim() || formData.titulo.trim().length < 5) {
      nuevosErrores.push('El título debe tener al menos 5 caracteres');
    }
    if (!formData.descripcion.trim() || formData.descripcion.trim().length < 10) {
      nuevosErrores.push('La descripción debe tener al menos 10 caracteres');
    }
    if (sectoresSeleccionados.length === 0) {
      nuevosErrores.push('Debe seleccionar al menos un sector');
    }
    if (tipo === 'tarea' && !formData.prioridad) {
      nuevosErrores.push('Debe seleccionar una prioridad para la tarea');
    }
    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    const datosAnuncio = {
      ...formData,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      tipo,
      sectores: sectoresSeleccionados,
      creadoPor: usuario?.nombre || 'Usuario Desconocido',
      // Para pizarras, usar prioridad media por defecto
      prioridad: tipo === 'tarea' ? formData.prioridad : 'media',
    };

    try {
      if (anuncioEditar && onActualizar) {
        onActualizar(anuncioEditar.id, datosAnuncio);
      } else {
        onGuardar(datosAnuncio);
      }
      onCerrar();
    } catch (error) {
      console.error('Error al guardar anuncio:', error);
      setErrores(['Error al guardar el anuncio. Intente nuevamente.']);
    } finally {
      setGuardando(false);
    }
  };

  const handleSectorChange = (sector: string) => {
    setSectoresSeleccionados(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector) 
        : [...prev, sector]
    );
  };

  const handleInputChange = (campo: keyof typeof formData, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (errores.length > 0) setErrores([]);
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

          {usuario?.rol === 'admin' && (
            <div>
              <Label className="text-sm font-medium">Tipo de Anuncio *</Label>
              <RadioGroup
                value={tipo}
                onValueChange={(value) => setTipo(value as Anuncio['tipo'])}
                className="flex items-center space-x-4 mt-2"
                disabled={guardando || !!anuncioEditar}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tarea" id="tipo-tarea" />
                  <Label htmlFor="tipo-tarea">Tarea</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pizarra" id="tipo-pizarra" />
                  <Label htmlFor="tipo-pizarra">Pizarra</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div>
            <Label htmlFor="titulo" className="text-sm font-medium">Título *</Label>
            <Input id="titulo" value={formData.titulo} onChange={(e) => handleInputChange('titulo', e.target.value)} placeholder="Ingrese el título" disabled={guardando} maxLength={100} />
          </div>

          <div>
            <Label className="text-sm font-medium">Sectores *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {SECTORES_DISPONIBLES.map(sector => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={sectoresSeleccionados.includes(sector)}
                    onCheckedChange={() => handleSectorChange(sector)}
                    disabled={guardando}
                  />
                  <Label htmlFor={`sector-${sector}`} className="font-normal">{sector}</Label>
                </div>
              ))}
            </div>
          </div>

          {tipo === 'tarea' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prioridad" className="text-sm font-medium">Prioridad *</Label>
                <Select value={formData.prioridad} onValueChange={(value) => handleInputChange('prioridad', value)} disabled={guardando}>
                  <SelectTrigger><SelectValue placeholder="Seleccione la prioridad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {anuncioEditar && (
                <div>
                  <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value as Anuncio['estado'])} disabled={guardando}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="descripcion" className="text-sm font-medium">Descripción *</Label>
            <Textarea id="descripcion" value={formData.descripcion} onChange={(e) => handleInputChange('descripcion', e.target.value)} placeholder="Describa detalladamente..." rows={6} disabled={guardando} maxLength={1000} />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
            <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700">
              {guardando ? 'Guardando...' : anuncioEditar ? 'Actualizar' : 'Crear Anuncio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};