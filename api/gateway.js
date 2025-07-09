// api/gateway.js
const { Gateway, Wallets } = require('fabric-network');
const ccp = require('./connection-org1.json');

async function getAdminGateway() {
  const wallet = await Wallets.newFileSystemWallet('./wallet');
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'Admin@org1.example.com',  // nombre de tu identidad Admin
    discovery: { enabled: true, asLocalhost: true }
  });
  return gateway;
}

module.exports = { getAdminGateway };
