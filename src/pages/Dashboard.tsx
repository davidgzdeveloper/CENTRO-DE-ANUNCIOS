
import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FiltrosSidebar } from '@/components/FiltrosSidebar';
import { AnuncioCard } from '@/components/AnuncioCard';
import { FormularioAnuncio } from '@/components/FormularioAnuncio';
import { DetalleAnuncio } from '@/components/DetalleAnuncio';
import { ComentarioModal } from '@/components/ComentarioModal';
import { ConfirmacionModal } from '@/components/ConfirmacionModal';
import { useAnuncios } from '@/hooks/useAnuncios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Anuncio, FiltrosAnuncio } from '@/types';
import { FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { usuario } = useAuth();
  const {
    anuncios,
    crearAnuncio,
    actualizarAnuncio,
    cambiarEstado,
    agregarComentario,
    eliminarAnuncio,
    filtrarAnuncios
  } = useAnuncios();

  // Estados para modales
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState<Anuncio | null>(null);
  const [anuncioEditar, setAnuncioEditar] = useState<Anuncio | null>(null);
  const [anuncioEliminar, setAnuncioEliminar] = useState<string | null>(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosAnuncio>({
    estado: 'todos',
    sector: 'todos',
    prioridad: 'todas',
    textoBusqueda: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  // Anuncios filtrados
  const anunciosFiltrados = useMemo(() => {
    return filtrarAnuncios(filtros).sort((a, b) => {
      // Ordenar por prioridad primero (alta -> media -> baja)
      const prioridadOrder = { alta: 3, media: 2, baja: 1 };
      if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
        return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
      }
      // Luego por fecha de modificación (más reciente primero)
      return b.fechaModificacion.getTime() - a.fechaModificacion.getTime();
    });
  }, [filtros, filtrarAnuncios]);

  // Handlers para modales
  const handleNuevoAnuncio = () => {
    setAnuncioEditar(null);
    setModalFormulario(true);
  };

  const handleEditarAnuncio = (anuncio: Anuncio) => {
    setAnuncioEditar(anuncio);
    setModalFormulario(true);
  };

  const handleVerDetalle = (anuncio: Anuncio) => {
    setAnuncioSeleccionado(anuncio);
    setModalDetalle(true);
  };

  const handleAgregarComentario = (anuncio: Anuncio) => {
    setAnuncioSeleccionado(anuncio);
    setModalComentario(true);
  };

  const handleEliminarAnuncio = (id: string) => {
    setAnuncioEliminar(id);
    setModalConfirmacion(true);
  };

  // Handlers para acciones
  const handleCrearAnuncio = (nuevoAnuncio: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => {
    crearAnuncio(nuevoAnuncio);
    toast({
      title: "Anuncio creado",
      description: "El anuncio se ha creado exitosamente.",
    });
  };

  const handleActualizarAnuncio = (id: string, cambios: Partial<Anuncio>) => {
    actualizarAnuncio(id, cambios);
    toast({
      title: "Anuncio actualizado",
      description: "Los cambios se han guardado exitosamente.",
    });
  };

  const handleCambiarEstado = (id: string, nuevoEstado: Anuncio['estado']) => {
    cambiarEstado(id, nuevoEstado);
    const estadoTexto = nuevoEstado === 'en_proceso' ? 'En Proceso' : 
                       nuevoEstado === 'completado' ? 'Completado' : 'Pendiente';
    toast({
      title: "Estado actualizado",
      description: `El anuncio se ha marcado como ${estadoTexto}.`,
    });
  };

  const handleAgregarComentarioAction = (idAnuncio: string, texto: string, autor: string) => {
    agregarComentario(idAnuncio, texto, autor);
    toast({
      title: "Comentario agregado",
      description: "Su comentario se ha agregado exitosamente.",
    });
  };

  const handleConfirmarEliminacion = () => {
    if (anuncioEliminar) {
      eliminarAnuncio(anuncioEliminar);
      toast({
        title: "Anuncio eliminado",
        description: "El anuncio se ha eliminado exitosamente.",
        variant: "destructive"
      });
      setAnuncioEliminar(null);
    }
    setModalConfirmacion(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      estado: 'todos',
      sector: 'todos',
      prioridad: 'todas',
      textoBusqueda: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNuevoAnuncio={handleNuevoAnuncio} />
      
      <div className="flex">
        {/* Sidebar de filtros */}
        <div className={`transition-all duration-300 ${mostrarFiltros ? 'w-80' : 'w-0'} overflow-hidden`}>
          <div className="p-6">
            <FiltrosSidebar
              filtros={filtros}
              onFiltrosChange={setFiltros}
              onLimpiarFiltros={handleLimpiarFiltros}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="p-6">
            {/* Header de contenido */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
                
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-lg font-semibold">
                    {anunciosFiltrados.length} anuncio{anunciosFiltrados.length !== 1 ? 's' : ''} 
                    {filtros.estado !== 'todos' || filtros.sector !== 'todos' || 
                     filtros.prioridad !== 'todas' || filtros.textoBusqueda 
                      ? ' (filtrados)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de anuncios */}
            {anunciosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  No se encontraron anuncios
                </h3>
                <p className="text-gray-400 mb-6">
                  {filtros.estado !== 'todos' || filtros.sector !== 'todos' || 
                   filtros.prioridad !== 'todas' || filtros.textoBusqueda
                    ? 'Intente ajustar los filtros para ver más resultados.'
                    : 'Aún no hay anuncios creados en el sistema.'}
                </p>
                {usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado') && (
                  <Button onClick={handleNuevoAnuncio} className="bg-blue-600 hover:bg-blue-700">
                    Crear Primer Anuncio
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {anunciosFiltrados.map((anuncio) => (
                  <AnuncioCard
                    key={anuncio.id}
                    anuncio={anuncio}
                    onVerDetalle={handleVerDetalle}
                    onCambiarEstado={handleCambiarEstado}
                    onEditar={handleEditarAnuncio}
                    onEliminar={handleEliminarAnuncio}
                    onAgregarComentario={handleAgregarComentario}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormularioAnuncio
        abierto={modalFormulario}
        onCerrar={() => setModalFormulario(false)}
        onGuardar={handleCrearAnuncio}
        anuncioEditar={anuncioEditar}
        onActualizar={handleActualizarAnuncio}
      />

      <DetalleAnuncio
        anuncio={anuncioSeleccionado}
        abierto={modalDetalle}
        onCerrar={() => setModalDetalle(false)}
        onAgregarComentario={handleAgregarComentarioAction}
      />

      <ComentarioModal
        anuncio={anuncioSeleccionado}
        abierto={modalComentario}
        onCerrar={() => setModalComentario(false)}
        onAgregarComentario={handleAgregarComentarioAction}
      />

      <ConfirmacionModal
        abierto={modalConfirmacion}
        onCerrar={() => setModalConfirmacion(false)}
        onConfirmar={handleConfirmarEliminacion}
        titulo="Eliminar Anuncio"
        descripcion="¿Está seguro de que desea eliminar este anuncio? Esta acción no se puede deshacer y se perderán todos los comentarios asociados."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipo="danger"
      />
    </div>
  );
};
