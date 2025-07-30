✅ Starting the Fabric Test Network With Channel
./network.sh down && docker ps -a && ./network.sh up createChannel -ca -c mychannel

🔹 Para probar: Despliego un chaincode llamado basicts para verificar red (REGISTRO y COMMIT, no ejecución aún)
./network.sh deployCCAAS -ccn basicts -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript

✅ Despliego el grupo de chaincodes bajo el nombre supplychain
./network.sh deployCCAAS -ccn supplychain -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript

✅ Con el id generado convoco a 
./runChaincodeSupplyChain.sh para levarntar el servidro

✅ En una  nueva terminal. Levanto el servidor API para acceder a los endpoints
cd api
node app.js

✅ En una  nueva terminal. levanto el servidor web
cd web 
npm run dev

git remote add origin https://github.com/codecrypto-academy/majorabe.git

git checkout -b web3-pf-hyperledgerfabric