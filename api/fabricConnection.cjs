const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Calculamos __dirname de forma nativa en CommonJS
const CCP_PATH = path.resolve(
  __dirname,
  '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
);
const ccp = JSON.parse(fs.readFileSync(CCP_PATH, 'utf8'));

// Ruta donde vive tu wallet de identidades
const WALLET_PATH = path.resolve(__dirname, 'wallet');

async function getGateway(identityLabel) {
  // 1) Abre (o crea) el wallet
  const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

  // 2) Conecta el Gateway con esa identidad
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: identityLabel,
    discovery: { enabled: true, asLocalhost: true }
  });

  return gateway;
}

async function getContract(channel = 'mychannel', chaincode = 'supplychain', identityLabel = 'Admin@org1.example.com') {
  const gateway = await getGateway(identityLabel);
  const network = await gateway.getNetwork(channel);
  return network.getContract(chaincode);
}

module.exports = { getGateway, getContract };
