// api/enrollCAAdmin.cjs
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
  // 1) Leer el connection profile
  const ccpPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
  );
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const caTLS = caInfo.tlsCACerts.pem;

  // 2) Instanciar Fabric CA client
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLS, verify: false }, caInfo.caName);

  // 3) Enrolear CA Admin (admin/adminpw)
  const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });

  // 4) Importar en wallet local
  const walletPath = path.resolve(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes()
    },
    mspId: 'Org1MSP',
    type: 'X.509'
  };
  await wallet.put('ca-admin', x509Identity);

  console.log('✅ CA Admin identity enrolled and imported as "ca-admin"');
}

main().catch(err => {
  console.error('❌ Error en enrollCAAdmin:', err);
  process.exit(1);
});
