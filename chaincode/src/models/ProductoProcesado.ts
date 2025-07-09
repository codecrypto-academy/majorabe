export type UnidadMedida = 'Litros' | 'Kilogramos' | 'Unidades';
export type EstadoProducto = 'Procesado' | 'EnDistribucion'| 'EnVenta' | 'Vendido'; 

export interface ProductoProcesado {
  id: string;
  idLoteOrigen: string; // Vincula al LoteLeche
  idProcesador: string;
  tipoProducto: string; // Ej., 'Leche Pasteurizada', 'Queso'
  cantidad: number;
  unidadMedida: UnidadMedida;
  fechaProcesamiento: string; // Formato ISO
  estado: EstadoProducto;
  idDistribuidor?: string;
  idDestino?: string;
}