export interface EventoLote {
  timestamp: string;
  actor: string;
  accion: string;
}

export interface Lote {
  id: string;
  idProductor: string;
  volumenLitros: number;
  fechaProduccion: string;
  estado: 'Producido' | 'AsignadoATransportista' | 'EnTransito' | 'AsignadoAProcesador' | 'Recibido' | 'Rechazado' | 'Consumido';
  idTransportista?: string;
  idProcesador?: string;
  historial?: EventoLote[];
}

export interface Entidad {
  id: string;
  tipo: string;
  nombre: string;
  ubicacion: string;
  estado: string;
}
