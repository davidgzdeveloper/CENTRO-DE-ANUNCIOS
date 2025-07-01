
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmacionModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'warning' | 'danger';
  cargando?: boolean;
}

export const ConfirmacionModal = ({
  abierto,
  onCerrar,
  onConfirmar,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tipo = 'warning',
  cargando = false
}: ConfirmacionModalProps) => {
  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-full ${
              tipo === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                tipo === 'danger' ? 'text-red-600' : 'text-yellow-600'
              }`} />
            </div>
            <DialogTitle className="text-lg">{titulo}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {descripcion}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onCerrar}
            disabled={cargando}
            className="w-full sm:w-auto"
          >
            {textoCancelar}
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={cargando}
            className={`w-full sm:w-auto ${
              tipo === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
