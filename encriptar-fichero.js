// Importación de las librerías necesarias
const { createCipheriv, createECDH } = require('crypto'); 
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

// Configuración para el cifrado AES 
const algoritmo = "aes-256-cbc"; 

// Crear una instancia del cifrador con la clave secreta derivada (32 bytes para la clave, 16 para IV)
var cifrador = createCipheriv(algoritmo, secret.slice(0, 32), secret.slice(0, 16)); 

// Leer el contenido del archivo a cifrar
const texto = fs.readFileSync("./data/" + args.data); 

// Cifrar el contenido del archivo
let textoCifrado = cifrador.update(texto, 'utf-8', 'hex'); 
textoCifrado += cifrador.final("hex"); 

// Guardar con un nombre que incluye la clave pública y el archivo original
fs.writeFileSync("./data/" + args.public + "-" + args.data + ".enc", textoCifrado); 
