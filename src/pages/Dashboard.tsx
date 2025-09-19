import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FiltrosSidebar } from '@/components/FiltrosSidebar';
import { AnuncioCard } from '@/components/AnuncioCard';
import { FormularioAnuncio } from '@/components/FormularioAnuncio';
import { DetalleAnuncio } from '@/components/DetalleAnuncio';
import { ComentarioModal } from '@/components/ComentarioModal';
import { ConfirmacionModal } from '@/components/ConfirmacionModal';
import { CartelCotizacion } from '@/components/CartelCotizacion';
import { ModalCotizaciones } from '@/components/ModalCotizaciones';
import { useAnuncios } from '@/hooks/useAnuncios';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Anuncio, FiltrosAnuncio } from '@/types';
import { FileText, Filter, Clock, AlertTriangle, CheckCircle, ClipboardList, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Dashboard = () => {
  const { usuario } = useAuth();
  const { anuncios, crearAnuncio, actualizarAnuncio, cambiarEstado, agregarComentario, eliminarAnuncio, filtrarAnuncios } = useAnuncios();
  const { cotizacion, loading: loadingCotizaciones, actualizarCotizaciones } = useCotizaciones();

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalCotizaciones, setModalCotizaciones] = useState(false);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState<Anuncio | null>(null);
  const [anuncioEditar, setAnuncioEditar] = useState<Anuncio | null>(null);
  const [anuncioEliminar, setAnuncioEliminar] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosAnuncio>({ estado: 'todos', sector: 'todos', prioridad: 'todas', textoBusqueda: '' });
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [vistaPrincipal, setVistaPrincipal] = useState('tareas');

  const datosFiltrados = useMemo(() => {
    const anunciosVisibles = filtrarAnuncios(filtros).sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
    
    const tareas = anunciosVisibles.filter(a => a.tipo === 'tarea');
    const pizarra = anunciosVisibles.filter(a => a.tipo === 'pizarra');

    return {
      pizarra,
      tareas: {
        pendientes: tareas.filter(t => t.estado === 'pendiente'),
        enProceso: tareas.filter(t => t.estado === 'en_proceso'),
        completados: tareas.filter(t => t.estado === 'completado'),
      }
    };
  }, [filtros, filtrarAnuncios]);

  // Handlers para modales y acciones (sin cambios, omitidos por brevedad)
  const handleNuevoAnuncio = () => { setAnuncioEditar(null); setModalFormulario(true); };
  const handleEditarAnuncio = (anuncio: Anuncio) => { setAnuncioEditar(anuncio); setModalFormulario(true); };
  const handleVerDetalle = (anuncio: Anuncio) => { setAnuncioSeleccionado(anuncio); setModalDetalle(true); };
  const handleAgregarComentario = (anuncio: Anuncio) => { setAnuncioSeleccionado(anuncio); setModalComentario(true); };
  const handleEliminarAnuncio = (id: string) => { setAnuncioEliminar(id); setModalConfirmacion(true); };
  const handleCrearAnuncio = (nuevoAnuncio: Omit<Anuncio, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'comentarios'>) => {
    crearAnuncio(nuevoAnuncio);
    toast({ title: "Anuncio creado", description: "El anuncio se ha creado exitosamente." });
  };
  const handleActualizarAnuncio = (id: string, cambios: Partial<Anuncio>) => {
    actualizarAnuncio(id, cambios);
    toast({ title: "Anuncio actualizado", description: "Los cambios se han guardado exitosamente." });
  };
  const handleCambiarEstado = (id: string, nuevoEstado: Anuncio['estado']) => {
    cambiarEstado(id, nuevoEstado);
    const estadoTexto = nuevoEstado === 'en_proceso' ? 'En Proceso' : 'Completado';
    toast({ title: "Estado actualizado", description: `La tarea se ha marcado como ${estadoTexto}.` });
  };
  const handleAgregarComentarioAction = (idAnuncio: string, texto: string, autor: string) => {
    agregarComentario(idAnuncio, texto, autor);
    toast({ title: "Comentario agregado" });
  };
  const handleConfirmarEliminacion = () => {
    if (anuncioEliminar) {
      eliminarAnuncio(anuncioEliminar);
      toast({ title: "Anuncio eliminado", variant: "destructive" });
      setAnuncioEliminar(null);
    }
    setModalConfirmacion(false);
  };
  const handleLimpiarFiltros = () => setFiltros({ estado: 'todos', sector: 'todos', prioridad: 'todas', textoBusqueda: '' });

  // Handlers para cotizaciones
  const handleEditarCotizaciones = () => setModalCotizaciones(true);
  const handleGuardarCotizaciones = async (nuevasCotizaciones: { dolar: number; dolarViejo: number; real: number }) => {
    if (!usuario) return;
    try {
      await actualizarCotizaciones(nuevasCotizaciones, usuario.nombre);
      toast({
        title: "Cotizaciones actualizadas",
        description: "Las cotizaciones se han actualizado exitosamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las cotizaciones.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const renderGridAnuncios = (listaAnuncios: Anuncio[], mensajeVacio: string) => {
    if (listaAnuncios.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">{mensajeVacio}</h3>
          <p className="text-gray-400">Intente ajustar los filtros o cree un nuevo anuncio.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {listaAnuncios.map((anuncio) => (
          <AnuncioCard key={anuncio.id} anuncio={anuncio} onVerDetalle={handleVerDetalle} onCambiarEstado={handleCambiarEstado} onEditar={handleEditarAnuncio} onEliminar={handleEliminarAnuncio} onAgregarComentario={handleAgregarComentario} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNuevoAnuncio={handleNuevoAnuncio} />

      {/* Cartel de Cotizaciones */}
      <CartelCotizacion
        cotizacion={cotizacion}
        loading={loadingCotizaciones}
        esAdmin={usuario?.rol === 'admin'}
        onEditarCotizaciones={handleEditarCotizaciones}
      />
      <div className="flex flex-col lg:flex-row">
        <div className={`transition-all duration-300 ${mostrarFiltros ? 'w-full lg:w-80' : 'w-0'} overflow-hidden`}>
          <div className="p-4 lg:p-6">
            <FiltrosSidebar filtros={filtros} onFiltrosChange={setFiltros} onLimpiarFiltros={handleLimpiarFiltros} tipoVista={vistaPrincipal} />
          </div>
        </div>

        <div className="flex-1">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="sm" onClick={() => setMostrarFiltros(!mostrarFiltros)} className="lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>

            <Tabs value={vistaPrincipal} onValueChange={setVistaPrincipal} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tareas" className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5" />
                  <span>Tareas</span>
                </TabsTrigger>
                <TabsTrigger value="pizarra" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Pizarra</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pizarra">
                {renderGridAnuncios(datosFiltrados.pizarra, 'No hay anuncios en la pizarra')}
              </TabsContent>

              <TabsContent value="tareas">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna Pendientes */}
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">Pendientes</h3>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                          {datosFiltrados.tareas.pendientes.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 min-h-[400px]">
                      {datosFiltrados.tareas.pendientes.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">No hay tareas pendientes</p>
                        </div>
                      ) : (
                        datosFiltrados.tareas.pendientes.map((anuncio) => (
                          <AnuncioCard
                            key={anuncio.id}
                            anuncio={anuncio}
                            onVerDetalle={handleVerDetalle}
                            onCambiarEstado={handleCambiarEstado}
                            onEditar={handleEditarAnuncio}
                            onEliminar={handleEliminarAnuncio}
                            onAgregarComentario={handleAgregarComentario}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Columna En Proceso */}
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b bg-blue-50 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">En Proceso</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {datosFiltrados.tareas.enProceso.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 min-h-[400px]">
                      {datosFiltrados.tareas.enProceso.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">No hay tareas en proceso</p>
                        </div>
                      ) : (
                        datosFiltrados.tareas.enProceso.map((anuncio) => (
                          <AnuncioCard
                            key={anuncio.id}
                            anuncio={anuncio}
                            onVerDetalle={handleVerDetalle}
                            onCambiarEstado={handleCambiarEstado}
                            onEditar={handleEditarAnuncio}
                            onEliminar={handleEliminarAnuncio}
                            onAgregarComentario={handleAgregarComentario}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Columna Completados */}
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b bg-green-50 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-gray-900">Completados</h3>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {datosFiltrados.tareas.completados.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 min-h-[400px]">
                      {datosFiltrados.tareas.completados.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">No hay tareas completadas</p>
                        </div>
                      ) : (
                        datosFiltrados.tareas.completados.map((anuncio) => (
                          <AnuncioCard
                            key={anuncio.id}
                            anuncio={anuncio}
                            onVerDetalle={handleVerDetalle}
                            onCambiarEstado={handleCambiarEstado}
                            onEditar={handleEditarAnuncio}
                            onEliminar={handleEliminarAnuncio}
                            onAgregarComentario={handleAgregarComentario}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modales */}
      {usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado') && (
        <FormularioAnuncio abierto={modalFormulario} onCerrar={() => setModalFormulario(false)} onGuardar={handleCrearAnuncio} anuncioEditar={anuncioEditar} onActualizar={handleActualizarAnuncio} />
      )}
      <DetalleAnuncio anuncio={anuncioSeleccionado} abierto={modalDetalle} onCerrar={() => setModalDetalle(false)} onAgregarComentario={handleAgregarComentarioAction} />
      <ComentarioModal anuncio={anuncioSeleccionado} abierto={modalComentario} onCerrar={() => setModalComentario(false)} onAgregarComentario={handleAgregarComentarioAction} />
      <ConfirmacionModal abierto={modalConfirmacion} onCerrar={() => setModalConfirmacion(false)} onConfirmar={handleConfirmarEliminacion} titulo="Eliminar Anuncio" descripcion="¿Está seguro de que desea eliminar este anuncio? Esta acción no se puede deshacer." tipo="danger" />

      {/* Modal de Cotizaciones */}
      {usuario?.rol === 'admin' && (
        <ModalCotizaciones
          abierto={modalCotizaciones}
          onCerrar={() => setModalCotizaciones(false)}
          onGuardar={handleGuardarCotizaciones}
          cotizacionActual={cotizacion}
          nombreUsuario={usuario.nombre}
        />
      )}
    </div>
  );
};