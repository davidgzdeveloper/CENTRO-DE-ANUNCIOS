
export interface Usuario {
  id: string;
  nombre: string;
  rol: 'admin' | 'empleado' | 'visualizador';
}

export interface Comentario {
  id: string;
  texto: string;
  autor: string;
  fecha: Date;
}

export interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  sector: 'Despacho' | 'Tienda' | 'Lavadero' | 'Mantenimiento' | 'Administración';
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'en_proceso' | 'completado';
  fechaCreacion: Date;
  fechaModificacion: Date;
  creadoPor: string;
  comentarios: Comentario[];
}

export interface FiltrosAnuncio {
  estado: string;
  sector: string;
  prioridad: string;
  textoBusqueda: string;
}
