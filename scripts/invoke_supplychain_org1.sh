#!/bin/bash
set -e

# 1) Calcula la ruta absoluta de este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 2) Sube a test-network
TESTNET_DIR="$SCRIPT_DIR/../fabric-samples/test-network"
cd "$TESTNET_DIR"

# Ahora BASEDIR es test-network
BASEDIR="$PWD"

# ---------------------------------------------------
# Variables globales para Org1
export FABRIC_CFG_PATH="$BASEDIR/config"
export ORDERER_CA="$BASEDIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_MSPCONFIGPATH="$BASEDIR/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="$BASEDIR/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_ADDRESS=localhost:7051
# ---------------------------------------------------


# Verificaciones básicas
if [ ! -f "$ORDERER_CA" ]; then
  echo "❌ Certificado del orderer no encontrado en $ORDERER_CA"
  exit 1
fi
if ! ss -tuln | grep -q ":7051"; then
  echo "❌ Peer no está corriendo en puerto 7051"
  exit 1
fi

echo "✅ Peer Org1 activo"

# Menú de transacciones
echo "⚙️ Opciones disponibles para 'supplychain':"
echo "1) initAdmin                (AdminContract)"
echo "2) registerProducer <ID>    (ProducerContract)"
echo "3) recordTransport <ID>     (TransportContract)"
echo "4) processBatch <ID>        (ProcessorContract)"
echo "5) distributeBatch <ID>     (DistributorContract)"
echo "6) recordRetailSale <ID>    (RetailContract)"
echo "7) ping                     (PingContract)"
echo "8) salir"

read -rp "👉 Elegí una opción: " OPCION

case $OPCION in
  1)
    echo "🚀 initAdmin..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"initAdmin","Args":[]}' --waitForEvent
    ;;
  2)
    read -rp "📝 Ingresá ProducerID: " ID
    echo "🚀 registerProducer \"$ID\"..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"registerProducer","Args":["'"$ID"'"]}' --waitForEvent
    ;;
  3)
    read -rp "📝 Ingresá TransportID: " ID
    echo "🚀 recordTransport \"$ID\"..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"recordTransport","Args":["'"$ID"'"]}' --waitForEvent
    ;;
  4)
    read -rp "📝 Ingresá BatchID para procesar: " ID
    echo "🚀 processBatch \"$ID\"..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"processBatch","Args":["'"$ID"'"]}' --waitForEvent
    ;;
  5)
    read -rp "📝 Ingresá BatchID para distribuir: " ID
    echo "🚀 distributeBatch \"$ID\"..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"distributeBatch","Args":["'"$ID"'"]}' --waitForEvent
    ;;
  6)
    read -rp "📝 Ingresá SaleID de retail: " ID
    echo "🚀 recordRetailSale \"$ID\"..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"recordRetailSale","Args":["'"$ID"'"]}' --waitForEvent
    ;;
  7)
    echo "🚀 ping..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name supplychain \
      -c '{"function":"ping","Args":[]}' --waitForEvent
    ;;
  8)
    echo "👋 Saliendo..."
    exit 0
    ;;
  *)
    echo "❌ Opción inválida"
    ;;
esac
