export type EstadoLoteLeche =
  | 'Producido'
  | 'AsignadoATransportista'
  | 'EnTransito'
  | 'AsignadoAProcesador'
  | 'Recibido'
  | 'Rechazado' 
  | 'Consumido'; 

export interface EventoLote {
  timestamp: string;     
  actor: string;
  accion: string;
}

export interface LoteLeche {
  id: string;
  idProductor: string;
  volumenLitros: number;
  fechaProduccion: string; // Formato ISO
  estado: EstadoLoteLeche;
  idTransportista?: string;
  idProcesador?: string;
  historial?: EventoLote[];
}

