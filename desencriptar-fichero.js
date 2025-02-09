// Importación de las librerías necesarias
const { createDecipheriv, createECDH } = require('crypto'); 
const { exit } = require('process'); 
const args = require("yargs").argv; 
const fs = require("fs"); 

// Verificación de los argumentos requeridos: private, public y data
if (!args.private && !args.public && !args.data) {
    console.log('Faltan parámetros'); 
    exit(0); 
}

// Crear una instancia de ECDH con el algoritmo 'secp521r1' (curva elíptica)
const origen = createECDH('secp521r1');

// Leer la clave privada desde el archivo correspondiente y Configurar la clave privada en la instancia de ECDH
const key = fs.readFileSync("./data/" + args.private + ".key").toString(); 
origen.setPrivateKey(key, "hex"); 

// Leer la clave pública desde el archivo correspondiente
const pub = fs.readFileSync("./data/" + args.public + ".pb").toString(); 

// Generación de la clave secreta (512 bits) compartida entre las claves pública y privada
const secret = Uint8Array.from(origen.computeSecret(pub, "hex", "hex")); 

// Configuración para el descifrado AES 
const algoritmo = "aes-256-cbc"; 

// Crear una instancia del descifrado con la clave secreta derivada (32 bytes para la clave, 16 para IV)
var descifrador = createDecipheriv(algoritmo, secret.slice(0, 32), secret.slice(0, 16)); 

// Leer el contenido del archivo a descifrar
const inputFile = "./data/" + args.private + "-" + args.data + ".enc";
console.log(inputFile);
const texto = fs.readFileSync(inputFile).toString();  

// Cifrar el contenido del archivo
let textodescifrado = descifrador.update(texto, 'hex', 'utf-8'); 
textodescifrado += descifrador.final("utf-8"); 

console.log(textodescifrado);
const outputFile = "./data/" + args.private + "-" + args.data + ".des";
fs.writeFileSync(outputFile, textodescifrado);