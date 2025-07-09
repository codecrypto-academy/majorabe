import { Lote} from '../types/supplychain';
/**
 * Acorta una dirección (wallet) mostrando los primeros 10 y los últimos 6 caracteres.
 */
export const acortarDireccion = (direccion: string): string => {
  if (!direccion || direccion.length < 16) return direccion;
  return `${direccion.slice(0, 10)}...${direccion.slice(-6)}`;
};

/**
 * Convierte una fecha ISO a formato dd/mm/aaaa.
 */
export const formatFecha = (fechaISO: string): string => {
  const date = new Date(fechaISO);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

/**
 * Pinta de color los diferentes estados de un Lote de leche
 */
export const estadoColor = (estado: Lote['estado']) => {
    switch (estado) {
      case 'Producido':
        return 'bg-blue-100 text-blue-800';
      case 'AsignadoATransportista':
        return 'bg-yellow-100 text-yellow-800';
      case 'EnTransito':
        return 'bg-orange-100 text-orange-800';
      case 'AsignadoAProcesador':
        return 'bg-pink-100 text-indigo-800';
      case 'Recibido':
        return 'bg-green-100 text-green-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      case 'Consumido':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };