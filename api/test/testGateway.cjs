// api/testGateway.cjs
const { getGateway } = require('./fabricConnection.cjs');

async function main() {
  try {
    const gateway = await getGateway('Admin@org1.example.com');
    console.log('✅ Gateway conectado como Admin');
    await gateway.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al conectar gateway:', err);
    process.exit(1);
  }
}

main();
