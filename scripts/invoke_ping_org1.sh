#!/bin/bash
# Script para invocar chaincode "ping" desde Org1. Ejecutar desde test network como:  ../../scripts/invoke_ping_org1.sh

export FABRIC_CFG_PATH=$PWD/../config

# Variables de entorno para Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_MSPCONFIGPATH=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export FABRIC_CFG_PATH=$PWD/../config
export ORDERER_CA=$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem


# 🔧 verificar si el archivo del certificado existe
if [ ! -f "$ORDERER_CA" ]; then
  echo "❌ Certificado del orderer no encontrado en $ORDERER_CA"
  exit 1
fi

# 🔧 Verificar que el peer esté activo
if ! ss -tuln | grep -q ":7051"; then
  echo "❌ Peer no está corriendo en puerto 7051"
  exit 1
fi

echo "✅ Peer activo"

# 🎛️ Menú
echo "⚙️ Opciones disponibles:"
echo "1 - ping"
echo "2 - ping2 con nombre"
echo "3 - pingHola con nombre"
echo "4 - salir"

read -rp "👉 Elegí una opción (1/2/3/4): " OPCION

case $OPCION in
  1)
    echo "🚀 Ejecutando ping..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name ping \
      -c '{"function":"ping","Args":[]}' --waitForEvent
    ;;
  2)
    read -rp "📝 Ingresá un nombre: " NAME
    echo "🚀 Ejecutando ping2 con nombre..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name ping \
      -c '{"function":"ping2","Args":["'"$NAME"'"]}' --waitForEvent
    ;;
  3)
    read -rp "📝 Ingresá un nombre: " NAME
    echo "🚀 Ejecutando pingHola con nombre..."
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID mychannel --name ping \
      -c '{"function":"pingHola","Args":["'"$NAME"'"]}' --waitForEvent
    ;;
  4)
    echo "👋 Saliendo..."
    exit 0
    ;;
  *)
    echo "❌ Opción inválida"
    ;;
esac
