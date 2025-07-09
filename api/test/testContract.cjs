// api/testContract.cjs
const { getContract } = require('./fabricConnection.cjs');

async function main() {
  try {
    // Obtenemos el contract usando la identidad Admin
    const contract = await getContract('mychannel', 'supplychain', 'Admin@org1.example.com');

    // Invocamos la función ping (o init, o la que tengas)
    const result = await contract.evaluateTransaction('Ping');
    console.log('✅ Ping Response:', result.toString());

    process.exit(0);
  } catch (err) {
    console.error('❌ Error invocando el contrato con Admin:', err);
    process.exit(1);
  }
}

main();
