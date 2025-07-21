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
import { FileText, Filter, Clock, AlertTriangle, CheckCircle, ClipboardList, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Dashboard = () => {
  const { usuario } = useAuth();
  const { anuncios, crearAnuncio, actualizarAnuncio, cambiarEstado, agregarComentario, eliminarAnuncio, filtrarAnuncios } = useAnuncios();

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState<Anuncio | null>(null);
  const [anuncioEditar, setAnuncioEditar] = useState<Anuncio | null>(null);
  const [anuncioEliminar, setAnuncioEliminar] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosAnuncio>({ estado: 'todos', sector: 'todos', prioridad: 'todas', textoBusqueda: '' });
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [vistaPrincipal, setVistaPrincipal] = useState('tareas');
  const [vistaTareas, setVistaTareas] = useState('pendientes');

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
                <Tabs value={vistaTareas} onValueChange={setVistaTareas} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 gap-2">
                    <TabsTrigger value="pendientes" className="flex items-center justify-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Pendientes</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{datosFiltrados.tareas.pendientes.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="enProceso" className="flex items-center justify-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>En Proceso</span>
                      <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{datosFiltrados.tareas.enProceso.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completados" className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Completados</span>
                      <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium">{datosFiltrados.tareas.completados.length}</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pendientes">{renderGridAnuncios(datosFiltrados.tareas.pendientes, 'No hay tareas pendientes')}</TabsContent>
                  <TabsContent value="enProceso">{renderGridAnuncios(datosFiltrados.tareas.enProceso, 'No hay tareas en proceso')}</TabsContent>
                  <TabsContent value="completados">{renderGridAnuncios(datosFiltrados.tareas.completados, 'No hay tareas completadas')}</TabsContent>
                </Tabs>
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
    </div>
  );
};