#!/bin/bash
set -e

# ————————————————
export CORE_CHAINCODE_ID_NAME="supplychain_1.0:64b889f25cdad9b75a1bd193448f75baccfabffb45ca0e3ae83e44bee86b7b3f"
export CORE_CHAINCODE_SERVER_ADDRESS="0.0.0.0:9998"
# ————————————————

cd "$(dirname "$0")"
echo "📂 Directorio de trabajo: $(pwd)"
echo "🔗 CORE_CHAINCODE_ID_NAME      = $CORE_CHAINCODE_ID_NAME"
echo "🚀 CORE_CHAINCODE_SERVER_ADDRESS = $CORE_CHAINCODE_SERVER_ADDRESS"

echo "🔧 Instalando dependencias y compilando..."
npm install
npm run build

if [ ! -f dist/index.js ]; then
  echo "❌ No encontré dist/index.js. Ejecuta 'npm run build' y corrige errores."
  exit 1
fi

echo "▶️ Arrancando servidor chaincode-as-a-service con npm start…"
# Ahora npm start usa las variables CORE_CHAINCODE_*
npm start
