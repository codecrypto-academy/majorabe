// api/importAdmin.cjs
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
  // 1) Wallet local de la API
  const walletPath = path.resolve(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // 2) Ruta base al MSP de Admin en tu test-network
  const basePath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp'
  );

  // 3) Leer certificado: toma el único .pem en signcerts/
  const signCertsDir = path.join(basePath, 'signcerts');
  const certFiles = fs.readdirSync(signCertsDir).filter(f => f.endsWith('.pem'));
  if (certFiles.length === 0) {
    throw new Error(`No se encontró ningún .pem en ${signCertsDir}`);
  }
  const cert = fs.readFileSync(path.join(signCertsDir, certFiles[0]), 'utf8');

  // 4) Leer clave privada: toma el único archivo en keystore/
  const keyDir = path.join(basePath, 'keystore');
  const keyFiles = fs.readdirSync(keyDir);
  if (keyFiles.length === 0) {
    throw new Error(`No se encontró ningún archivo en ${keyDir}`);
  }
  const key = fs.readFileSync(path.join(keyDir, keyFiles[0]), 'utf8');

  // 5) Construir la identidad X.509
  const identity = {
    credentials: {
      certificate: cert,
      privateKey: key
    },
    mspId: 'Org1MSP',
    type: 'X.509'
  };

  // 6) Importarla en el wallet con la etiqueta 'Admin@org1.example.com'
  await wallet.put('Admin@org1.example.com', identity);
  console.log('✅ Identidad Admin importada en wallet');
}

main().catch(err => {
  console.error('❌ Error importando Admin:', err);
  process.exit(1);
});
