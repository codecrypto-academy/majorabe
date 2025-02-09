# Proyecto de Intercambio Seguro de Archivos 🔒🔒🔒
Este proyecto tiene como objetivo facilitar el intercambio de archivos de manera confiable y segura utilizando criptografía moderna, por lo cual se implementa  un sistema que permite a los usuarios intercambiar archivos de manera segura a través de una infraestructura basada en criptografía de clave pública y clave privada.

# Flujo del Proyecto

## Generación de las claves:
Cada usuario genera un par de claves (clave pública y clave privada) utilizando criptografía elíptica.
La clave pública se comparte con los usuarios de confianza.

## Intercambio de archivos:
El archivo se cifra utilizando AES-256 CBC y la clave simétrica generada a través de Diffie-Hellman.
El archivo cifrado se envía al destinatario.

## Desencriptación:
El destinatario utiliza su clave privada y la clave simétrica compartida a través de Diffie-Hellman para desencriptar el archivo.

# Tecnologías Utilizadas
🔑 Criptografía Elíptica (ECC)
🔑 AES-256 CBC para encriptación de archivos
🔑 Diffie-Hellman para generación de claves simétricas

