# Red Privada Ethereum con Proof of Authority

## Objetivo

El objetivo de este proyecto es crear una red privada de Ethereum con múltiples nodos utilizando un mecanismo de consenso Proof of Authority (PoA). 
Además, se busca:
✅ Usar Node.js y la librería web3.js para automatizar la configuración y gestión de la red.
✅ Acceder a la red mediante web3.js, MetaMask y la consola de Geth.
✅ Implementar GraphQL para consultas sobre la blockchain.

## Pasos para la configuración de la red

1️⃣ Crear cuentas en cada nodo
```sh
geth --datadir nodo1 account new --password pwd.txt
geth --datadir nodo2 account new --password pwd.txt
geth --datadir nodo3 account new --password pwd.txt
```
2️⃣ Inicializar cada nodo con genesis.json
```sh
geth --datadir nodo1 init genesis.json
geth --datadir nodo2 init genesis.json
geth --datadir nodo3 init genesis.json
```
3️⃣ Crear y ejecutar el bootnode en nodo1
```sh
bootnode --genkey boot.key
bootnode --verbosity=9 --nodekey=boot.key
```
📌 Esto generará una enode://... que se usara en el siguiente paso.
enode://959661cfbe54a576eae1b0b9729f480dc53d8450ba163d9ba29a5b723da9dc47882a572d1782e9331cab9dacbab21553a39ac1ff3f4ee183fd584a97f72255df@127.0.0.1:0?discport=30301

4️⃣ Lanzar los nodos conectarlos al bootnode (ejecutar desde la raiz del proyecto - no desde los nodos)

🔹 En nodo1:
```sh
geth --datadir nodo1
--networkid 100517 
--syncmode full 
--http --http.api "admin,eth,miner,net,txpool,personal" 
--http.port 9545 
--allow-insecure-unlock 
--unlock "0x8f1744863b002c97958d25b3caf9633e0280ddd1" 
--password pwd.txt 
--port 30034 
--bootnodes "enode://959661cfbe54a576eae1b0b9729f480dc53d8450ba163d9ba29a5b723da9dc47882a572d1782e9331cab9dacbab21553a39ac1ff3f4ee183fd584a97f72255df@127.0.0.1:0?discport=30301"


geth --datadir nodo2 
--networkid 100517 
--ipcpath "\\.\pipe\geth2.ipc" 
--authrpc.port 8553 
--syncmode full 
--http --http.api "admin,eth,miner,net,txpool,personal" 
--http.port 9546 
--allow-insecure-unlock 
--unlock "0x0d7cfb9fc7734a83b866d47a5f9e5f40545f16ac"
--password pwd.txt 
--port 30035 
--bootnodes "enode://959661cfbe54a576eae1b0b9729f480dc53d8450ba163d9ba29a5b723da9dc47882a572d1782e9331cab9dacbab21553a39ac1ff3f4ee183fd584a97f72255df@127.0.0.1:0?discport=30301"

geth --datadir nodo3 --networkid 100517 --ipcpath "\\.\pipe\geth3.ipc" --authrpc.port 8552 --syncmode full --http --http.api "admin,eth,miner,net,txpool,personal" 
--http.port 9547 --allow-insecure-unlock --unlock "0x6bb6917946d5091b01c83468b770259f8658eb7b" --password pwd.txt --port 30036 --bootnodes "enode://959661cfbe54a576eae1b0b9729f480dc53d8450ba163d9ba29a5b723da9dc47882a572d1782e9331cab9dacbab21553a39ac1ff3f4ee183fd584a97f72255df@127.0.0.1:0?discport=30301"
```
📌 Comandos utiles para verificar lo realizado por consola
  
``` sh
geth attach http://127.0.0.1:9547
 admin.peers 
 admin.nodeInfo
 admin.nodeInfo.protocols.eth.network
 eth.blockNumber
 eth.getBlock(numdebloque)
 ```

5️⃣ Agregar un nuevo nodo a una red en funcionamiento. 
 ``` sh
 geth --datadir nodo4 account new --password pwd.txt
 geth --datadir nodo4 init genesis.json

 geth --datadir nodo4 --networkid 100517 --ipcpath "\\.\pipe\geth4.ipc" --authrpc.port 8554 --syncmode full --http --http.api "admin,eth,miner,net,txpool,personal" --http.port 9548 --allow-insecure-unlock --unlock "0x5d1b33874e7f345a3bfbe3e1b3370871ce6dc070" --password pwd.txt --port 30037 --bootnodes "enode://959661cfbe54a576eae1b0b9729f480dc53d8450ba163d9ba29a5b723da9dc47882a572d1782e9331cab9dacbab21553a39ac1ff3f4ee183fd584a97f72255df@127.0.0.1:0?discport=30301"
 ```

