🚛 Supply Chain Láctea

🏗️ Modelo lógico:
Entidad	            Descripción	                                    Ejemplo Real
Administrador	    Superusuario que registra las entidades
                    y les da identidad	Una cámara lechera,         SENASA o autoridad del sistema
Productor	        Genera la materia prima (leche cruda)	        Tamberos, granjas lecheras
Transportista	    Traslada leche desde productor hacia planta	    Camiones cisterna
Procesador	        Procesa la leche en productos derivados	        Usinas lácteas, fábricas de queso
Distribuidor	    Lleva productos a puntos de venta	            Empresas logísticas
Punto de Venta	    Comercializa al consumidor final	            Supermercados, tiendas, etc.

Estructura del proyecto

proy-trazab-hlf/
├── chaincode/
│   ├── src/
│   │   ├── config/             # Configuraciones para usar en los contratos
│   │   ├── contracts/          # Contratos inteligentes
│   │   ├── models/             # Definición de entidades y tipos
│   │   ├── utils/              # Funciones auxiliares
│   │   ├── index.ts            # Registro de contratos
│   │   ├── package.json        
│   │   └── tsconfig.json
│   ├── dist/                   # Código compilado JS
│   ├── runChaincode.sh         # Script para ejecutar en modo servidor (CCAAS)
│   └── Dockerfile              # Docker del chaincode
├── fabric-samples/             # Red Fabric
│   ├── test-network/          
├── api/                        # API Express para interactuar
├── scripts/                    # Scripts Bash útiles
└── README.md

# Pasos 

## Levantar la Fabric Test Network con Channel

```
./network.sh down && docker ps -a && ./network.sh up createChannel -ca -c mychannel
```

## Desplegar el grupo de chaincodes bajo el nombre supplychain
```
./network.sh deployCCAAS -ccn supplychain -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript
```
 Con lo cual en docker tenemos la red levanata don los contenderoers tal vemos en la imagen
(agregar imagen de screen/pantalla1.png)

## POner a correr el servidor de CCAAs tomando el CORE_CHAINCODE_ID_NAME arrojado en el despliegue anterior.
```
cd chaincode
./runChaincodeSupplyChain.sh
```

## Preparar espacio para entidades 
En la carpeta api/wallet tendremos las identidades X.509 de todos los participantes

debe enrollarse la identidad de administrador
```
cd api
node enrollCAAdmin.cjs
```
✅ CA Admin identity enrolled and imported as "ca-admin" (esto nos devolvera)

Esto crea una identidad llamada ca-admin, necesaria para registrar nuevos usuarios.
✔ Esto conectará a la CA (ca.org1.example.com) y almacenará ca-admin en wallet/.

Luego  Importar la identidad del Admin de Org1
Este paso añade Admin@org1.example.com al wallet, usando el material criptográfico de Fabric (clave y certificado):
```
node importAdmin.cjs
```
✅ Identidad Admin importada en wallet
✔ Este usuario es el que tu backend usa para interactuar con los contratos como administrador.

Ya con las identidades correctamente almacenadas, se puede iniciar el back
```
node app.js
```
y el frontend desde la carpeta web
```
cd web
npm run dev
```
mostrar la screen/pantalla2.png

