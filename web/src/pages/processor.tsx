import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Lote, EventoLote } from '../types/supplychain';
import { acortarDireccion } from '../utils/helpers';

export default function ProcessorPage() {
  const [account, setAccount] = useState('');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [status, setStatus] = useState('');
  const [modalLote, setModalLote] = useState<Lote | null>(null);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const refresh = (accounts: string[]) => {
      const raw = accounts[0] || '';
      setAccount(raw.trim().toLowerCase());
    };
    eth.request({ method: 'eth_requestAccounts' }).then(refresh).catch(console.error);
    eth.on('accountsChanged', refresh);
    return () => eth.removeListener('accountsChanged', refresh);
  }, []);

  useEffect(() => {
    if (account) fetchLotes();
  }, [account]);

  const fetchLotes = async () => {
    try {
      const res = await fetch(`http://localhost:5555/processor/lotes?account=${account}`);
      const data = await res.json();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const aceptarEntrega = async (idLote: string) => {
    setStatus(`Aceptando entrega de ${idLote}...`);
    try {
      const res = await fetch('http://localhost:5555/processor/aceptar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, idLote })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchLotes();
      setStatus(`Lote ${idLote} recibido con éxito`);
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  const rechazarEntrega = async (idLote: string) => {
    setStatus(`Rechazando entrega de ${idLote}...`);
    try {
      const res = await fetch('http://localhost:5555/processor/rechazar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, idLote })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchLotes();
      setStatus(`Lote ${idLote} rechazado`);
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  const lotesFiltrados = lotes.filter(lote =>
    lote.estado === 'Recibido' ||  lote.estado === 'AsignadoAProcesador'
  );

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <img src="/industria.png" alt="Procesador" className="h-10 w-10 mr-3" />
        <h2 className="text-2xl font-semibold">Processor Dashboard</h2>
      </div>

      {!account ? (
        <p className="text-center py-6 text-gray-600">Conectá MetaMask para continuar</p>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
          <p>Cuenta: <code>{acortarDireccion(account)}</code></p>
          </p>

          {status && (
            <p className="mb-4 text-sm bg-yellow-200 text-yellow-900 p-2 rounded">{status}</p>
          )}

          <div className="bg-white p-6 rounded shadow mb-8">
            <h3 className="font-semibold mb-4">Lotes asignados</h3>
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Volumen</th>
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
                    <td className="px-4 py-2 space-y-2">
                      {lote.estado === 'AsignadoAProcesador' && (
                        <>
                          <button
                            onClick={() => aceptarEntrega(lote.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >Aceptar</button>
                          <button
                            onClick={() => rechazarEntrega(lote.id)}
                            className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >Rechazar</button>
                        </>
                      )}
                      <button
                        onClick={() => setModalLote(lote)}
                        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >Historial</button>
                    </td>
                  </tr>
                ))}
                {lotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No hay lotes asignados actualmente.
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
