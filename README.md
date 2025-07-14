# 🧀 Blockchain Láctea - Proyecto de Trazabilidad con Hyperledger Fabric

Este proyecto implementa una cadena de suministro láctea utilizando **Hyperledger Fabric** y **Chaincode-as-a-Service (CCAAS)**. Permite registrar entidades (productores, transportistas, procesadores) y seguir la trazabilidad de los lotes de leche desde el tambo hasta la planta procesadora.

## 📂 Estructura Relevante del Proyecto

```bash
.
├── chaincode/               # Contratos inteligentes TypeScript para cada entidad
│   ├── src/
│   └── runChaincodeSupplyChain.sh
├── fabric-samples/          # Red de prueba Hyperledger (test-network)
│   └── test-network
│       └── network.sh
├── api/                     # Backend Node.js para interactuar con Fabric
│   ├── app.js
│   ├── fabricConnection.cjs
│   ├── gateway.js
│   ├── enrollCAAdmin.cjs
│   ├── importAdmin.cjs
│   └── wallet/              # Almacén de identidades X.509
└── web/                     # Interfaz web con Next.js
```

# ⚙️ Pasos para ejecutar el sistema 

## 1️⃣ Levantar la red Fabric con canal
Desde la carpeta fabric-samples/test-network:
```
./network.sh down && docker ps -a && ./network.sh up createChannel -ca -c mychannel
```

## 2️⃣ Desplegar el grupo de chaincodes bajo el nombre supplychain
```
./network.sh -ccn supplychain -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript
```
Esto lanza los contenedores como se muestra a continuación:
![Contenedores Docker](./screen/pantalla_docker.png)

## 3️⃣ Iniciar el servidor de CCAAS.
```
cd chaincode
./runChaincodeSupplyChain.sh
```
Este script debe tomar las variables de entorno CORE_CHAINCODE_ID_NAME y CHAINCODE_SERVER_ADDRESS correctamente.

## 👤 Preparar identidades de participantes
En la carpeta api/wallet se almacenarán las identidades X.509.

### Enrollar la identidad de administrador de la CA
```
cd api
node enrollCAAdmin.cjs
```
✅ Resultado esperado:  
`CA Admin identity enrolled and imported as "ca-admin"`

Esto conecta con la CA (`ca.org1.example.com`) y almacena `ca-admin` en la carpeta `wallet/`.

### Importar la identidad del Admin de Org1
```
node importAdmin.cjs
```
✅ Resultado esperado:
Identidad Admin importada en wallet

## 🚀 Iniciar backend y frontend
### Backend (API): 
```
node app.js
```
Accesible en: http://localhost:5555

### Frontend (Next.js): 
```
cd web
npm install
npm run dev
```
Accesible en: http://localhost:3000


### 💡 Uso de la Interfaz
Al iniciar sesión como administrador, podrás:
* Crear perfiles de entidades asociados a direcciones blockchain (wallets)
*  Visualizar y administrar las entidades activas
* Seguir el movimiento de lotes de leche a lo largo de la cadena

![Cadena de Suministro](./screen/pantalla_cadena.png)
![Dashboard Admin](./screen/pantalla_admin.png)