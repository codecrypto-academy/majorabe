// Importación de las librerías necesarias
const {createECDH} = require("crypto");
const args = require("yargs").argv;
const fs = require("fs");

// Mostrar en consola el argumento proporcionado con --name
console.log(args.name);

// Validación de la existencia del argumento --name
if(!args.name){
    console.log("Falta el argumento --name");
    exit(0);
}

// Crear una nueva pareja de claves (pública y privada) utilizando el algoritmo de curva elíptica secp521r1
const parejaDeClaves = createECDH("secp521r1");

// Generar las claves pública y privada en formato hexadecimal
const clavePublica = parejaDeClaves.generateKeys("hex");
const clavePrivada = parejaDeClaves.getPrivateKey("hex");

// Guardar la clave pública en un archivo con extensión .pb en la carpeta ./data
fs.writeFileSync("./data/" + args.name + ".pb", clavePublica);

// Guardar la clave privada en un archivo con extensión .key en la carpeta ./data
fs.writeFileSync("./data/" + args.name + ".key", clavePrivada);

console.log("Claves generadas correctamente: " + args.name);
