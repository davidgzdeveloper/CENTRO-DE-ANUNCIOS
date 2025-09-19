import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface Cotizacion {
  dolar: number;
  dolarViejo: number;
  real: number;
  fechaActualizacion: Date;
  actualizadoPor: string;
}

interface ModalCotizacionesProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (cotizaciones: { dolar: number; dolarViejo: number; real: number }) => Promise<void>;
  cotizacionActual: Cotizacion | null;
  nombreUsuario: string;
}

export const ModalCotizaciones = ({
  abierto,
  onCerrar,
  onGuardar,
  cotizacionActual,
  nombreUsuario
}: ModalCotizacionesProps) => {
  const [formData, setFormData] = useState({
    dolar: '',
    dolarViejo: '',
    real: ''
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto && cotizacionActual) {
      setFormData({
        dolar: cotizacionActual.dolar.toString(),
        dolarViejo: cotizacionActual.dolarViejo.toString(),
        real: cotizacionActual.real.toString()
      });
    } else if (abierto) {
      setFormData({
        dolar: '',
        dolarViejo: '',
        real: ''
      });
    }
    setErrores([]);
  }, [abierto, cotizacionActual]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: string[] = [];

    const dolar = parseFloat(formData.dolar);
    const dolarViejo = parseFloat(formData.dolarViejo);
    const real = parseFloat(formData.real);

    if (!formData.dolar || isNaN(dolar) || dolar <= 0) {
      nuevosErrores.push('El dólar debe ser un número válido mayor a 0');
    }
    if (!formData.dolarViejo || isNaN(dolarViejo) || dolarViejo <= 0) {
      nuevosErrores.push('El dólar viejo debe ser un número válido mayor a 0');
    }
    if (!formData.real || isNaN(real) || real <= 0) {
      nuevosErrores.push('El real debe ser un número válido mayor a 0');
    }

    // Validar que el dólar sea razonable (entre 100 y 10000 pesos argentinos)
    if (!isNaN(dolar) && (dolar < 100 || dolar > 10000)) {
      nuevosErrores.push('El valor del dólar parece incorrecto (debe estar entre 100 y 10000)');
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await onGuardar({
        dolar: parseFloat(formData.dolar),
        dolarViejo: parseFloat(formData.dolarViejo),
        real: parseFloat(formData.real)
      });
      onCerrar();
    } catch (error) {
      console.error('Error al guardar cotizaciones:', error);
      setErrores(['Error al guardar las cotizaciones. Intente nuevamente.']);
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (campo: keyof typeof formData, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (errores.length > 0) setErrores([]);
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Actualizar Cotizaciones</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.length > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errores.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {/* Dólar */}
            <div>
              <Label htmlFor="dolar" className="text-sm font-medium flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Dólar (USD) *</span>
              </Label>
              <Input
                id="dolar"
                type="number"
                step="0.01"
                min="0"
                value={formData.dolar}
                onChange={(e) => handleInputChange('dolar', e.target.value)}
                placeholder="Ej: 1250.50"
                disabled={guardando}
                className="mt-1"
              />
            </div>

            {/* Dólar Viejo */}
            <div>
              <Label htmlFor="dolarViejo" className="text-sm font-medium flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span>Dólar Viejo (USD Viejo) *</span>
              </Label>
              <Input
                id="dolarViejo"
                type="number"
                step="0.01"
                min="0"
                value={formData.dolarViejo}
                onChange={(e) => handleInputChange('dolarViejo', e.target.value)}
                placeholder="Ej: 1200.00"
                disabled={guardando}
                className="mt-1"
              />
            </div>

            {/* Real */}
            <div>
              <Label htmlFor="real" className="text-sm font-medium flex items-center space-x-2">
                <span className="text-blue-600 font-bold">R$</span>
                <span>Real Brasileño (BRL) *</span>
              </Label>
              <Input
                id="real"
                type="number"
                step="0.01"
                min="0"
                value={formData.real}
                onChange={(e) => handleInputChange('real', e.target.value)}
                placeholder="Ej: 245.75"
                disabled={guardando}
                className="mt-1"
              />
            </div>
          </div>

          {/* Información del usuario */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Usuario:</strong> {nombreUsuario}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Esta actualización quedará registrada en el historial
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={guardando}
              className="bg-green-600 hover:bg-green-700"
            >
              {guardando ? 'Guardando...' : 'Actualizar Cotizaciones'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};