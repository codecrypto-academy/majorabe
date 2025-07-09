🧾 PASOS de configuaracion luego de tener Hyperledger Fabric instalado

🔹 Dentro de  ./fabric-samples/test-network/scripts/deployCCAAS.sh hago los cambios:
Linea 18:
  CC_END_POLICY="OR('Org1MSP.member')"

Linea 89:
cat > "$tempdir/src/connection.json" <<CONN_EOF
{
  "address": "host.docker.internal:9998",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

--------------------------------------------------------
🧾 PASOS para levantar la red

✅ Terminal #1 - Starting the Fabric Test Network With Channel
./network.sh down && docker ps -a && ./network.sh up createChannel -ca -c mychannel

🔹 Para probar: Despliego un chaincode llamado basicts para verificar red (REGISTRO y COMMIT, no ejecución aún)
./network.sh deployCCAAS -ccn basicts -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript

--------------------------------------------------------
🧾 PASOS para ejecutar el chaincode propio: PingContract

✅1. Empaquetar, instalar y aprobar el chaincode Ping desde test-network
./network.sh deployCCAAS -ccn ping -ccp ../../chaincode -ccl typescript

🔹 Este comando se encarga internamente de:
empaquetar (ping.tar.gz) - instalar - aprobar - commit - y hasta lanzar el contenedor externo

🔹 el script también ejecuta los pasos de:
instalación en peers de ambas organizaciones - aprobación por Org1 y Org2 - commit en el canal

🔹 Obtengo el Id del contrato y pegarlo en runChainCode.sh

✅ 2. Con el Id del Chaincode obtenido completo el script runChaincode.sh para levantar el servidor de chaincode 
    (Dejo corriendo en una terminal este servidor)

✅ 3.Invocar el chaincode:
En otra terminal desde test-network invoco el contrato con el script que tengo preparado para eso.
    source ../../scripts/invoke_ping_org1.sh

--------------------------------------------------------
🧾 CUANDO REINICIO LA RED DEBO VOLVER A GENERAR LAS IDENTIDADES DESDE API

1. Limpiar el wallet antiguo (Borra todo dentro de api/wallet)
2. Re-enrolar al CA Admin (Desde la carpeta api). Esto creará la identidad ca-admin nueva.
    node enrollCAAdmin.cjs
3. Importar al Admin de Org1.Esto añadirá Admin@org1.example.com al wallet, usando el crypto material recién generado.
    node importAdmin.cjs
4. Levantar la API Ya con las identidades actualizadas.
    node app.js
