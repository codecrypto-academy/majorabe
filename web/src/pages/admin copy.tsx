// src/pages/admin.tsx
import { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Entidad } from '../types/supplychain';

export default function AdminPage({ entidades }: { entidades: Entidad[] }) {
const [form, setForm] = useState({ account: '', tipo: 'Productor', nombre: '', ubicacion: '' });
const [status, setStatus] = useState('');
const [list, setList] = useState<Entidad[]>(entidades);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name } = e.target;
  let { value } = e.target;
  
  // Si es el campo account, lo recortamos y pasamos a minúsculas
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
  }
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
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Registrando…' : 'Crear Entidad'}
        </button>
      </div>

      {/* Mensaje de estado con fondo amarillo brillante */}
      {status && (
        <p className="mt-3 text-sm bg-yellow-200 text-yellow-900 p-2 rounded md:col-span-2">
          {status}
        </p>
      )}

    </form>
    {status && <p className="mb-4 text-green-700">{status}</p>}
    <table className="min-w-full bg-white shadow rounded">
      <thead className="bg-gray-100 border-b">
        <tr>
          <th className="px-4 py-2 text-left">ID</th>
          <th className="px-4 py-2 text-left">Tipo</th>
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Ubicación</th>
          <th className="px-4 py-2 text-left">Estado</th>
        </tr>
      </thead>
      <tbody>
        {list.map(e => (
          <tr key={e.id} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2">{e.id}</td>
            <td className="px-4 py-2">{e.tipo}</td>
            <td className="px-4 py-2">{e.nombre}</td>
            <td className="px-4 py-2">{e.ubicacion}</td>
            <td className="px-4 py-2">{e.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Layout>
);
}

export async function getServerSideProps() {
// axios es una librería para hacer solicitudes HTTP desde el frontend
// aquí la usamos para llamar a nuestro endpoint de la API que devuelve la lista de entidades
const res = await axios.get<Entidad[]>('http://localhost:5555/admin/list');
return { props: { entidades: res.data } };
}
