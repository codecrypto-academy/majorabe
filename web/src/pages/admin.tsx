// src/pages/admin.tsx
import { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Entidad, Lote} from '../types/supplychain';
import { acortarDireccion, formatFecha , estadoColor} from '../utils/helpers';

function sortData<T>(data: T[], field: keyof T, asc: boolean): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal < bVal) return asc ? -1 : 1;
    if (aVal > bVal) return asc ? 1 : -1;
    return 0;
  });
}

const SortArrow = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
  return active ? (direction === 'asc' ? ' ▲' : ' ▼') : null;
};

export default function AdminPage({ entidades, lotes: initialLotes }: { entidades: Entidad[]; lotes: Lote[] }) {
  const [form, setForm] = useState({ account: '', tipo: 'Productor', nombre: '', ubicacion: '' });
  const [status, setStatus] = useState('');
  const [list, setList] = useState<Entidad[]>(entidades);
  const [lotes, setLotes] = useState<Lote[]>(initialLotes);

  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [sortConfigLotes, setSortConfigLotes] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'account') {
      value = value.trim().toLowerCase();
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Registrando…');
    try {
      await axios.post('http://localhost:5555/admin/create', {
        account: form.account.trim().toLowerCase(),
        tipo: form.tipo,
        nombre: form.nombre,
        ubicacion: form.ubicacion
      });
      setStatus('Entidad creada con éxito');
      const { data } = await axios.get<Entidad[]>('http://localhost:5555/admin/list');
      setList(data);
    } catch (err: any) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setTimeout(() => setStatus(''), 5000);
      setForm({ account: '', tipo: 'Productor', nombre: '', ubicacion: '' });
    }
  };

  const handleSort = (field: keyof Entidad) => {
    const direction = sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
    setList(sortData(list, field, direction === 'asc'));
  };

  const handleSortLotes = (field: keyof Lote) => {
    const direction = sortConfigLotes?.field === field && sortConfigLotes.direction === 'asc' ? 'desc' : 'asc';
    setSortConfigLotes({ field, direction });
    setLotes(sortData(lotes, field, direction === 'asc'));
  };

  const isProcessing = status === 'Registrando…';

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <img src="/administracion.png" alt="Administrador" className="h-10 w-10 mr-3" />
        <h2 className="text-2xl font-semibold">Admin User Dashboard</h2>
      </div>

      <form onSubmit={handleRegister} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Dirección MetaMask</label>
          <input
            name="account"
            value={form.account}
            onChange={handleChange}
            className="w-full rounded border-gray-300 p-2"
            placeholder="0x..."
            required
          />
        </div>
        <div>
          <label className="block mb-1">Tipo de Entidad</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
            className="w-full rounded border-gray-300 p-2"
          >
            <option value="">— Selecciona tipo —</option>
            <option value="Productor">Productor</option>
            <option value="Transportista">Transportista</option>
            <option value="Procesador">Planta Procesadora</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded border-gray-300 p-2"
            placeholder="Nombre de la entidad"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Ubicación</label>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            className="w-full rounded border-gray-300 p-2"
            placeholder="Ciudad o región"
            required
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className={`inline-block px-6 py-2 text-sm rounded text-white ${
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Registrando…' : 'Crear Entidad'}
          </button>
        </div>

        {status && (
          <p className="mt-3 text-sm bg-yellow-200 text-yellow-900 p-2 rounded md:col-span-2">
            {status}
          </p>
        )}
      </form>

      <h3 className="mb-2 text-xl font-semibold">Entidades registradas</h3>
      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('id')}>
              ID <SortArrow active={sortConfig?.field === 'id'} direction={sortConfig?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('tipo')}>
              Tipo <SortArrow active={sortConfig?.field === 'tipo'} direction={sortConfig?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nombre')}>
              Nombre <SortArrow active={sortConfig?.field === 'nombre'} direction={sortConfig?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('ubicacion')}>
              Ubicación <SortArrow active={sortConfig?.field === 'ubicacion'} direction={sortConfig?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {list.map(e => (
            <tr key={e.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{acortarDireccion(e.id)}</td>
              <td className="px-4 py-2">{e.tipo}</td>
              <td className="px-4 py-2">{e.nombre}</td>
              <td className="px-4 py-2">{e.ubicacion}</td>
              <td className="px-4 py-2">{e.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-10 mb-2 text-xl font-semibold">Lotes de leche</h3>
      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortLotes('id')}>
              ID <SortArrow active={sortConfigLotes?.field === 'id'} direction={sortConfigLotes?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortLotes('volumenLitros')}>
              Volumen (L) <SortArrow active={sortConfigLotes?.field === 'volumenLitros'} direction={sortConfigLotes?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSortLotes('fechaProduccion')}>
              Fecha Producción <SortArrow active={sortConfigLotes?.field === 'fechaProduccion'} direction={sortConfigLotes?.direction || 'asc'} />
            </th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map(l => (
            <tr key={l.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{l.id}</td>
              <td className="px-4 py-2">{l.volumenLitros}</td>
              <td className="px-4 py-2">{formatFecha(l.fechaProduccion)}</td>
              <td className={`px-4 py-2 rounded ${estadoColor(l.estado)}`}>{l.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export async function getServerSideProps() {
  const resEntidades = await axios.get<Entidad[]>('http://localhost:5555/admin/list');
  const entidades = resEntidades.data;

  let lotes: Lote[] = [];
  try {
    const resLotes = await axios.get('http://localhost:5555/producer/lotes/all');
    lotes = resLotes.data;
  } catch (error) {
    console.error('No se pudieron cargar los lotes:', error);
  }

  return { props: { entidades, lotes } };
}
