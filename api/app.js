import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import { getGateway, getContract } from './fabricConnection.cjs';

// --- Emular __dirname en ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5555;

app.use(cors());
app.use(bodyParser.json());

/**
 * Inicializa y devuelve cliente CA + wallet + userContext
 */
async function getCaClient() {
  const ccpPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
  );
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const caTLS = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLS, verify: false }, caInfo.caName);

  const walletPath = path.resolve(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identity = await wallet.get('ca-admin');
  if (!identity) throw new Error('No se encontró la identidad "ca-admin" en el wallet');

  const provider = wallet.getProviderRegistry().getProvider(identity.type);
  const adminUser = await provider.getUserContext(identity, 'ca-admin');

  return { ca, adminUser, wallet };
}

/**
 * Ping de prueba
 */
(async () => {
  const pingContract = await getContract();
  app.get('/ping', async (req, res) => {
    try {
      const result = await pingContract.evaluateTransaction('ping');
      res.json({ result: result.toString() });
    } catch (err) {
      console.error('Error Ping:', err);
      res.status(500).json({ error: err.message });
    }
  });
})();


/**
 *****************************  RUTAS DE ADMINISTRADOR*******
*/

/**
 * GET /admin/list
 * Devuelve todas las entidades (Productor, Transportista, Planta Procesadora)
 */
app.get('/admin/list', async (req, res) => {
  let gatewayAdmin;
  try {
    gatewayAdmin = await getGateway('Admin@org1.example.com');
    const network  = await gatewayAdmin.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'AdminContract');

    const result = await contract.evaluateTransaction('QueryAllEntidades');
    await gatewayAdmin.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /admin/list:', err);
    if (gatewayAdmin) await gatewayAdmin.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/create
 * Registra en la CA + crea la entidad en el ledger (Productor, Transportista o Planta Procesadora)
 * Body: { account, tipo, nombre, ubicacion }
 */
app.post('/admin/create', async (req, res) => {
  let gatewayAdmin;
  try {
    const { account, tipo, nombre, ubicacion } = req.body;
    if (!account || !tipo || !nombre || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos en el body: account, tipo, nombre, ubicacion' });
    }

    // 1) Registro y enroll en la CA
    const { ca, adminUser, wallet } = await getCaClient();
    const enrollmentSecret = await ca.register(
      {
        affiliation: 'org1.department1',
        enrollmentID: account.trim().toLowerCase(),
        role: 'client',
        attrs: [{ name: 'role', value: tipo, ecert: true }]
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: account.trim().toLowerCase(),
      enrollmentSecret
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };
    await wallet.put(account.trim().toLowerCase(), x509Identity);

    // 2) Conexión al ledger como Admin para crear la entidad
    gatewayAdmin = await getGateway('Admin@org1.example.com');
    const network  = await gatewayAdmin.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'AdminContract');
    await contract.submitTransaction(
      'RegistrarEntidad',
      account.trim().toLowerCase(),
      tipo,
      nombre,
      ubicacion
    );
    await gatewayAdmin.disconnect();

    res.json({ success: true, enrollmentSecret });
  } catch (err) {
    console.error('Error POST /admin/create:', err);
    if (gatewayAdmin) await gatewayAdmin.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 *****************************  RUTAS DE PRODUCTOR – lotes y transferencia
*/

/**
 * POST /producer/lote
 * Crea un nuevo lote de leche con identidad Producer.
 * Body: { account, idLote, volumenLitros, fechaProduccion }
 */
app.post('/producer/lote', async (req, res) => {
  let gatewayProducer;
  try {
    const { account, idLote, volumenLitros, fechaProduccion } = req.body;
    if (!account || !idLote || !volumenLitros || !fechaProduccion) {
      return res.status(400).json({ error: 'Datos incompletos para crear lote' });
    }
    gatewayProducer = await getGateway(account.trim().toLowerCase());
    const network  = await gatewayProducer.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProducerContract');

    // Verificar tipo de entidad
    const adminGateway = await getGateway('Admin@org1.example.com');
    const adminNetwork = await adminGateway.getNetwork('mychannel');
    const adminContract = adminNetwork.getContract('supplychain', 'AdminContract');
    const entidadRaw = await adminContract.evaluateTransaction('LeerEntidad', account.trim().toLowerCase());
    const entidad = JSON.parse(entidadRaw.toString());

    if (entidad.tipo !== 'Productor') {
      await adminGateway.disconnect();
      return res.status(403).json({ error: 'Solo los productores pueden crear lotes de leche' });
    }
    await adminGateway.disconnect();

    await contract.submitTransaction(
      'CrearLote',
      idLote,
      account.trim().toLowerCase(),
      volumenLitros.toString(),
      fechaProduccion
    );
    await gatewayProducer.disconnect();
    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /producer/lote:', err);
    if (gatewayProducer) await gatewayProducer.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /producer/lote/:idLote
 * Lee un lote por ID.
 * Query param: account
 */
app.get('/producer/lote/:idLote', async (req, res) => {
  let gatewayProducer;
  try {
    const account = (req.query.account)?.trim().toLowerCase();
    const { idLote } = req.params;
    if (!account) return res.status(400).json({ error: 'Falta query param account' });

    gatewayProducer = await getGateway(account);
    const network  = await gatewayProducer.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProducerContract');
    const result = await contract.evaluateTransaction('LeerLote', idLote);
    await gatewayProducer.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /producer/lote/:idLote:', err);
    if (gatewayProducer) await gatewayProducer.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /producer/lotes
 * Trae todos los lotes del productor.
 * Query param: account
 */
app.get('/producer/lotes', async (req, res) => {
  let gatewayProducer;
  try {
    const account = (req.query.account)?.trim().toLowerCase();
    if (!account) {
      return res.status(400).json({ error: 'Falta query param account' });
    }

    gatewayProducer = await getGateway(account);
    const network = await gatewayProducer.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProducerContract');

    const result = await contract.evaluateTransaction('QueryMyLotes', account);

    await gatewayProducer.disconnect();
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /producer/lotes:', err);
    if (gatewayProducer) await gatewayProducer.disconnect();
    res.status(500).json({ error: err.message });
  }
});


/**
 * POST /producer/send
 * Envía un lote al transportista.
 * Body: { account, idLote, destino }
 */
app.post('/producer/send', async (req, res) => {
  let gatewayProducer;
  try {
    const { account, idLote, idTransportista } = req.body;
    if (!account || !idLote || !idTransportista) {
      return res.status(400).json({ error: 'Faltan datos para enviar lote' });
    }

    gatewayProducer = await getGateway(account.trim().toLowerCase());
    const network  = await gatewayProducer.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProducerContract');

    await contract.submitTransaction(
      'EnviarLoteAlTransportista',
      idLote,
      idTransportista,
      account.trim().toLowerCase()
    );

    await gatewayProducer.disconnect();
    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /producer/send:', err);
    if (gatewayProducer) await gatewayProducer.disconnect();
    res.status(500).json({ error: err.message });
  }
});

app.get('/producer/lotes/all', async (req, res) => {
  let gateway;
  try {
    gateway = await getGateway('Admin@org1.example.com');
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProducerContract');

    const result = await contract.evaluateTransaction('QueryAllLotes');
    await gateway.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /producer/lotes/all:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 *****************************  RUTAS DEl TRANSPORTISTA *****
*/
app.get('/transport/lotes', async (req, res) => {
  let gatewayTransport;
  try {
    const account = (req.query.account)?.trim().toLowerCase();
    if (!account) {
      return res.status(400).json({ error: 'Falta query param account' });
    }

    gatewayTransport = await getGateway(account);
    const network = await gatewayTransport.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'TransportContract');
    const result = await contract.evaluateTransaction('QueryMyLotes');

    await gatewayTransport.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /transport/lotes:', err);
    if (gatewayTransport) await gatewayTransport.disconnect();
    res.status(500).json({ error: err.message });
  }
});


app.post('/transport/aceptar', async (req, res) => {
  let gatewayTransport;
  try {
    const { account, idLote } = req.body;
    if (!account || !idLote) {
      return res.status(400).json({ error: 'Faltan datos: account o idLote' });
    }

    gatewayTransport = await getGateway(account.toLowerCase());
    const network = await gatewayTransport.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'TransportContract');

    await contract.submitTransaction('AceptarLote', idLote);
    await gatewayTransport.disconnect();

    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /transport/aceptar:', err);
    if (gatewayTransport) await gatewayTransport.disconnect();
    res.status(500).json({ error: err.message });
  }
});

app.post('/transport/rechazar', async (req, res) => {
  let gatewayTransport;
  try {
    const { account, idLote } = req.body;
    if (!account || !idLote) {
      return res.status(400).json({ error: 'Faltan datos: account o idLote' });
    }

    gatewayTransport = await getGateway(account.toLowerCase());
    const network = await gatewayTransport.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'TransportContract');

    await contract.submitTransaction('RechazarLote', idLote);
    await gatewayTransport.disconnect();

    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /transport/rechazar:', err);
    if (gatewayTransport) await gatewayTransport.disconnect();
    res.status(500).json({ error: err.message });
  }
});

app.post('/transport/entregar', async (req, res) => {
  let gatewayTransport;
  try {
    const { account, idLote, idProcesador } = req.body;
    if (!account || !idLote || !idProcesador) {
      return res.status(400).json({ error: 'Faltan datos para entregar lote' });
    }

    gatewayTransport = await getGateway(account.toLowerCase());
    const network = await gatewayTransport.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'TransportContract');

    await contract.submitTransaction('EntregarAProcesador', idLote, idProcesador);
    await gatewayTransport.disconnect();

    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /transport/entregar:', err);
    if (gatewayTransport) await gatewayTransport.disconnect();
    res.status(500).json({ error: err.message });
  }
});

/**
 *****************************  RUTAS DE LA PLANTA PROCESADORA *****
*/
app.get('/processor/lotes', async (req, res) => {
  let gateway;
  try {
    const account = (req.query.account)?.trim().toLowerCase();
    if (!account) {
      return res.status(400).json({ error: 'Falta query param account' });
    }

    gateway = await getGateway(account);
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    const result = await contract.evaluateTransaction('QueryMyLotes');
    await gateway.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error('Error GET /processor/lotes:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});

app.post('/processor/aceptar', async (req, res) => {
  let gateway;
  try {
    const { account, idLote } = req.body;
    if (!account || !idLote) {
      return res.status(400).json({ error: 'Faltan datos: account o idLote' });
    }

    gateway = await getGateway(account.toLowerCase());
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    await contract.submitTransaction('AceptarLote', idLote);
    await gateway.disconnect();

    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /processor/aceptar:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});

app.post('/processor/rechazar', async (req, res) => {
  let gateway;
  try {
    const { account, idLote } = req.body;
    if (!account || !idLote) {
      return res.status(400).json({ error: 'Faltan datos: account o idLote' });
    }

    gateway = await getGateway(account.toLowerCase());
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    await contract.submitTransaction('RechazarLote', idLote);
    await gateway.disconnect();

    res.json({ success: true });
  } catch (err) {
    console.error('Error POST /processor/rechazar:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});



// Endpoint para obtener todos los lotes asignados al procesador conectado
app.get('/processor/lotes', async (req, res) => {
  let gateway;
  try {
    // Obtener dirección desde query param y normalizar
    const account = (req.query.account)?.trim().toLowerCase();
    if (!account) {
      return res.status(400).json({ error: 'Falta query param account' });
    }

    // Conectarse como planta procesadora
    gateway = await getGateway(account);
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    // Invoca el método QueryMyLotes del smart contract
    const result = await contract.evaluateTransaction('QueryMyLotes');

    await gateway.disconnect();
    res.json(JSON.parse(result.toString()));  // Devuelve los lotes en formato JSON
  } catch (err) {
    console.error('Error GET /processor/lotes:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});



// Endpoint para procesar un lote y generar un producto nuevo
app.post('/processor/procesar', async (req, res) => {
  let gateway;
  try {
    // Extraer los datos del cuerpo del request
    const { account, idLote, idProducto, tipoProducto, cantidad, unidadMedida, fechaProcesamiento } = req.body;

    // Validar que estén todos los campos requeridos
    if (!account || !idLote || !idProducto || !tipoProducto || !cantidad || !unidadMedida || !fechaProcesamiento) {
      return res.status(400).json({ error: 'Faltan datos para procesar el lote' });
    }

    // Conectarse como el procesador
    gateway = await getGateway(account.toLowerCase());
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    // Ejecutar la transacción en el smart contract
    await contract.submitTransaction(
      'ProcesarLote',
      idLote,
      idProducto,
      tipoProducto,
      cantidad.toString(),     // Pasar como string porque Fabric espera strings
      unidadMedida,
      fechaProcesamiento
    );

    await gateway.disconnect();
    res.json({ success: true });  // Confirmación de éxito
  } catch (err) {
    console.error('Error POST /processor/procesar:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para listar todos los productos procesados por el procesador conectado
app.get('/processor/productos', async (req, res) => {
  let gateway;
  try {
    // Obtener dirección desde query param
    const account = (req.query.account)?.trim().toLowerCase();
    if (!account) return res.status(400).json({ error: 'Falta query param account' });

    // Conectarse como el procesador
    gateway = await getGateway(account);
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('supplychain', 'ProcessorContract');

    // Ejecutar consulta para traer todos los productos de este procesador
    const result = await contract.evaluateTransaction('ListarMisProductos');

    await gateway.disconnect();
    res.json(JSON.parse(result.toString()));  // Devolver como JSON
  } catch (err) {
    console.error('Error GET /processor/productos:', err);
    if (gateway) await gateway.disconnect();
    res.status(500).json({ error: err.message });
  }
});




app.listen(port, () => {
  console.log(`🚀 API Fabric escuchando en http://localhost:${port}`);
});
