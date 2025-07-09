export type TipoEntidad = 'Productor' | 'Transportista' | 'PlantaProcesadora' | 'Distribuidor' | 'Minorista';
export type EstadoEntidad = 'Activo' | 'Inactivo';

export interface Entidad {
    id: string;
    tipo: TipoEntidad;
    nombre: string;
    ubicacion: string;
    estado: EstadoEntidad;
}