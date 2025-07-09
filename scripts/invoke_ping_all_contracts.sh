#!/bin/bash
set -e

# ---------------------------------------------------
# SCRIPT: invoke_ping_all_contracts.sh
#   Invoca la función Ping de cada contrato dentro
#   del chaincode “supplychain” para comprobar que
#   están corriendo correctamente en modo CCAAS.
# ---------------------------------------------------

# 1) Muévete siempre a test-network
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTNET_DIR="$SCRIPT_DIR/../fabric-samples/test-network"
cd "$TESTNET_DIR"

# 2) Rutas y entorno Org1
export FABRIC_CFG_PATH="$PWD/../config"
export ORDERER_CA="$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_MSPCONFIGPATH="$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_ADDRESS=localhost:7051

# 3) Verificaciones
if [ ! -f "$ORDERER_CA" ]; then
  echo "❌ No encuentro certificado del orderer en $ORDERER_CA"
  exit 1
fi
if ! ss -tuln | grep -q ":7051"; then
  echo "❌ Peer Org1 no está activo en el puerto 7051"
  exit 1
fi
echo "✅ Entorno de Org1 listo"

# 4) Lista de contratos y ping
CONTRACTS=(
  AdminContract
  ProducerContract
  TransportContract
  ProcessorContract
  DistributorContract
  RetailContract
  PingContract
)

for CONTRACT in "${CONTRACTS[@]}"; do
  echo
  echo "🔎 Probando Ping() en contrato: $CONTRACT"

  peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile "$ORDERER_CA" \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles "$CORE_PEER_TLS_ROOTCERT_FILE" \
    --channelID mychannel \
    --name supplychain \
    --contract "$CONTRACT" \
    --function Ping \
    --args "" \
    --waitForEvent
donewaitForEvent
done

echo
echo "🎉 ¡Todas las invocaciones Ping() han finalizado!"
