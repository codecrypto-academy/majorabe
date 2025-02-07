import express, { Request, Response } from "express";
import {ethers} from "ethers";
import cors from "cors";
import fs  from "fs";
require("dotenv").config();//carga las variables de entorno del archivo .env


const app = express();

app.use(express.json());// Middleware para analizar JSON en las solicitudes
app.use(cors());// Permitir todos los orígenes
const port = 3333;

//balance realizado desde Libreria Ehters
app.get('/api/balanceEthers/:address', async(req: Request, res: Response) => {
  const {address} = req.params;
  const provider = new ethers.JsonRpcProvider(process.env.URL_NODO);
  const balance = await provider.getBalance(address);
  res.json({
    address: address,
    balance: Number(balance) / 10 ** 18,
    fecha: new Date().toISOString()
  });
});

//Balance realizando una llamada manual RPC con fetch - sin usar librerias
app.get('/api/balance/:address', async(req: Request, res: Response) => {
    const {address} = req.params;
    
    try {
      // Realiza una solicitud HTTP POST a process.env.URL_NODO, 
      // que se asume es un nodo Ethereum corriendo en modo RPC (como geth o ganache-cli).
      const response = await fetch(process.env.URL_NODO as string,{        
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',             //Versión del protocolo.
            method: 'eth_getBalance',   //Método para obtener el balance de una dirección.        
            params: [ address, 'latest'],//Dirección de Ethereum y el bloque ('latest' indica el último bloque disponible)
            id: 1                       //ID arbitrario para identificar la solicitud.
          })
        });
   
     if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data:any = await response.json();
        //armo el json con la respuesta que me interesa
        res.json({
          address: address,
          balance: Number(data.result) / 10 ** 18,
          fecha: new Date().toISOString()
        }
          
        );
      } 
      catch (error) {
        console.error("Error en la solicitud:", error);
        res.status(500).json({ error: "Error al obtener balance" });
    }
    })
  app.get("/api/faucet/:address/:amount", async(req: Request, res: Response) => {
      const {address, amount} = req.params;
      const provider = new ethers.JsonRpcProvider(process.env.URL_NODO);
      const ruta = process.env.KEYSTORE_FILE as string;
      const rutaData = fs.readFileSync(ruta, "utf-8"); 
      const wallet = await ethers.Wallet.fromEncryptedJson(rutaData, process.env.KEYSTORE_PWD as string);
      const walletConnected = wallet.connect(provider);
      const tx = await walletConnected.sendTransaction({
        to: address,
        value: ethers.parseEther(amount)
      });
      await tx.wait(); // Espera hasta que la transacción esté confirmada
      const balance = await provider.getBalance(address);
      res.json({
        address: address,
        amount: amount,
        balance: Number(balance) / 10 ** 18,
        fecha: new Date().toISOString()
      });
 })    

//--------------------------------- Rutas de pruebas---------------------------
app.get("/params/:p1/:p2", (req: Request, res: Response) => {
  const { p1, p2 } = req.params;
  //console.log("Ruta alcanzada con parámetros:", p1, p2);
  res.send({p1:p1, p2:p2});
});

app.post("/", (req: Request, res: Response) => {
  const body = req.body;
  res.send(body);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
