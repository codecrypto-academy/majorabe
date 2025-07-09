import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Lote, EventoLote, Entidad } from '../types/supplychain';
import { acortarDireccion } from '../utils/helpers';

export default function ProducerPage() {
  const [account, setAccount] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [productionDate, setProductionDate] = useState(() => {
    const d = new Date();
    return d.toISOString().substr(0, 10);
  });
  const [status, setStatus] = useState('');
  const [envioStatus, setEnvioStatus] = useState('');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [transportistas, setTransportistas] = useState<Entidad[]>([]);
  const [transportistasSeleccionados, setTransportistasSeleccionados] = useState<{ [idLote: string]: string }>({});
  const [modalLote, setModalLote] = useState<Lote | null>(null);
  const [tipoEntidad, setTipoEntidad] = useState<string | null>(null);


  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const refresh = (accounts: string[]) => {
      const raw = accounts[0] || '';
      const acct = raw.trim().toLowerCase();
      setAccount(acct);
      setUnauthorized(false);
      setLotes([]);
    };
    eth.request({ method: 'eth_requestAccounts' }).then(refresh).catch(console.error);
    eth.on('accountsChanged', refresh);
    return () => {
      eth.removeListener('accountsChanged', refresh);
    };
  }, []);

  useEffect(() => {
    if (account) {
      fetchLotes(account);
      fetchTransportistas();
    }
  }, [account]);

  useEffect(() => {
    const fetchTipo = async () => {
      if (!account) return;
      try {
        const res = await fetch('http://localhost:5555/admin/list');
        const data = await res.json();
        const entidad = data.find((e: Entidad) => e.id === account.toLowerCase());
        if (entidad) {
          setTipoEntidad(entidad.tipo);
        }
      } catch (err) {
        console.error('Error al obtener el tipo de entidad:', err);
      }
    };
    fetchTipo();
  }, [account]);

  const fetchLotes = async (acct: string) => {
    setUnauthorized(false);
    try {
      const res = await fetch(`http://localhost:5555/producer/lotes?account=${acct}`);
      if (res.status === 500) {
        const err = await res.json();
        if (err.error?.includes('Identity not found')) {
          setUnauthorized(true);
          return;
        }
      }
      const data = await res.json();
      setLotes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransportistas = async () => {
    try {
      const res = await fetch('http://localhost:5555/admin/list');
      const data = await res.json();
      const filtrados = data.filter((ent: Entidad) => ent.tipo === 'Transportista');
      setTransportistas(filtrados);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrearLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Creando lote...');
    const suffix = account.slice(-6);
    const ts = Date.now();
    const idLote = `LOTE_${suffix}_${ts}`;

    try {
      const res = await fetch('http://localhost:5555/producer/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account,
          idLote,
          volumenLitros: Number(quantity),
          fechaProduccion: new Date(productionDate).toISOString()
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchLotes(account);
      setStatus(`Lote ${idLote} creado con éxito`);
      setQuantity('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus('Error: ' + err.message);
    }
  };

  const handleEnviarLote = async (loteId: string) => {
    const transportistaSeleccionado = transportistasSeleccionados[loteId];

    console.log("Enviando", {
      account,
      idLote: loteId,
      idTransportista: transportistaSeleccionado
    });

    if (!transportistaSeleccionado) {
      alert('Debe seleccionar un transportista');
      return;
    }

    setEnvioStatus(`Enviando ${loteId}...`);
    try {
      const res = await fetch('http://localhost:5555/producer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account,
          idLote: loteId,
          idTransportista: transportistaSeleccionado
        })
      });

      if (!res.ok) throw new Error(await res.text());
      await fetchLotes(account);
      setEnvioStatus(`Lote ${loteId} asignado al transportista.`);
      setTimeout(() => setEnvioStatus(''), 3000);
    } catch (err: any) {
      console.error(err);
      setEnvioStatus('Error: ' + err.message);
    }
  };

  const isProcessing = status !== '';
  const lotesFiltrados = lotes.filter(lote =>
    lote.estado === 'Producido' || lote.estado === 'AsignadoATransportista'
  );

  return (
    <Layout>
    <div className="flex items-center mb-6">
      <img src="/vaca.png" alt="Producer" className="h-10 w-10 mr-3" />
      <h2 className="text-2xl font-semibold">Producer User Dashboard</h2>
    </div>

      {!account ? (
        <p className="text-center py-6 text-gray-600">Conecta MetaMask para continuar</p>
      ) : unauthorized ? (
        <div className="max-w-md bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded">
          <h3 className="text-xl font-semibold mb-2">Acceso denegado</h3>
          <p>Su cuenta <code>{acortarDireccion(account)}</code> no está registrada como productor.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            <p>Cuenta: <code>{acortarDireccion(account)}</code></p>
          </p>

          {/* Crear Lote */}
          {tipoEntidad === 'Productor' && (
          <div className="bg-white p-6 rounded shadow mb-8 w-1/3">
            <h3 className="font-semibold mb-4">Crear Lote de Leche</h3>
            <form onSubmit={handleCrearLote} className="space-y-4">
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full rounded border-gray-300 p-2"
                placeholder="Cantidad (litros)"
                required
                disabled={isProcessing}
              />
              <label className="block">
                <span>Fecha de Producción</span>
                <input
                  type="date"
                  value={productionDate}
                  onChange={e => setProductionDate(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 p-2"
                  required
                  disabled={isProcessing}
                />
              </label>
              <button
                type="submit"
                className={`inline-block px-6 py-2 text-sm rounded text-white ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando…' : 'Crear Lote'}
              </button>
              
            </form>
            {status && (
              <p className="mt-3 text-sm bg-yellow-200 text-yellow-900 p-2 rounded">
                {status}
              </p>
            )}
          </div>
          )}
          {/* Tabla de Lotes */}
          <div className="bg-white p-6 rounded shadow mb-8">
            <h3 className="font-semibold mb-4">Mis Lotes</h3>
            {envioStatus && (
              <p className="mb-4 text-sm bg-blue-100 text-blue-900 p-2 rounded">
                {envioStatus}
              </p>
            )}
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Volumen (litros)</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Transportista</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.map(lote => (
                  <tr key={lote.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{lote.id}</td>
                    <td className="px-4 py-2">{lote.volumenLitros}</td>
                    <td className="px-4 py-2">{new Date(lote.fechaProduccion).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{lote.estado}</td>
                    <td className="px-4 py-2">{lote.idTransportista ? acortarDireccion(lote.idTransportista) : '—'}</td>
                    <td className="px-4 py-2">
                      {lote.estado === 'Producido' && (
                        <div className="space-y-2">
                          <select value={transportistasSeleccionados[lote.id] || ''}
                              onChange={e =>
                                setTransportistasSeleccionados(prev => ({
                                  ...prev,
                                  [lote.id]: e.target.value
                                }))
                              } 
                              className="w-full border p-1 rounded"
                            >
                              <option value="">Seleccione Transportista</option>
                              {transportistas.map(t => {
                                console.log("Transportista:", t);
                                return (
                                  <option key={t.id} value={t.id}>
                                    {t.nombre}
                                  </option>
                                );
                              })}
                          </select>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEnviarLote(lote.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              disabled={isProcessing}
                            > Enviar
                            </button>
                            <button
                              onClick={() => setModalLote(lote)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >Historial</button>
                          </div>  
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {lotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No tienes lotes todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        {modalLote && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
              <h4 className="text-lg font-semibold mb-4">Historial del lote {modalLote.id}</h4>
              <button
                onClick={() => setModalLote(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >✕</button>
              {modalLote.historial && modalLote.historial.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {modalLote.historial.map((ev, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="text-gray-700 font-medium">{new Date(ev.timestamp).toLocaleString()}:</span> {ev.accion} por <code>{ev.actor}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Este lote no tiene historial aún.</p>
              )}
            </div>
          </div>
        )}
        
        </>
      )}
    </Layout>
  );
}
