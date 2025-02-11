const express = require('express');
const { Web3 } = require('web3');
const cors = require('cors');

const app = express();
app.use(cors());

// URL de Infura para conectarse a Ethereum
const URL_INFURA = "https://mainnet.infura.io/v3/175201a837194881bf51ef88789ae3f4";
const web3 = new Web3(new Web3.providers.HttpProvider(URL_INFURA));

app.get('/', async (req, res) => {
    try {
        const bloque = await web3.eth.getBlockNumber();
        res.send({ bloque: bloque.toString() });
    } catch (error) {
        res.status(500).send({ error: "Error al obtener el número de bloque" });
    }
});

// Serializador personalizado para convertir BigInt a String
function bigIntToString(key, value) {
    return typeof value === 'bigint' ? value.toString() : value;
}

app.get('/bloque/:bloque', async (req, res) => {
    try {
        // Convertir el "bloque" a un número entero(10 -> en base decimal).
        const bloqueId = parseInt(req.params.bloque, 10);

        // Verificar si el parámetro "bloque" es un número válido.
        if (isNaN(bloqueId)) {
            return res.status(400).send({ error: 'El parámetro "bloque" debe ser un número válido.' });
        }

        // obtener el bloque desde su ID
        const bloque = await web3.eth.getBlock(bloqueId);
        
        // Verificar si el bloque existe.
        if (!bloque) {
            return res.status(404).send({ error: `El bloque ${bloqueId} no existe.` });
        }


        // Usar 'bigIntToString' para convertir los valores BigInt en strings.
        const bloqueStringified = JSON.stringify(bloque, bigIntToString);
        //res.send(bloqueStringified);

        // Enviar la respuesta con el bloque serializado como JSON (bien estructurado y procesado)
        res.send(JSON.parse(bloqueStringified));
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: `Error al buscar el bloque ${req.params.bloque}. Detalles: ${error.message}` });
    }
});


app.get('/tx/:tx', async (req, res) => {
    try {
        // Validar formato válido (cadena hexadecimal)
        const txHash = req.params.tx;
        if (!Web3.utils.isHex(txHash)) {
            return res.status(400).send({ error: 'El parámetro "tx" no es un hash de transacción válido.' });
        }

        // Obtener la transacción usando el hash
        const tx = await web3.eth.getTransaction(txHash);

        // Verificar si la transacción existe
        if (!tx) {
            return res.status(404).send({ error: `No se encontró la transacción con el hash ${txHash}.` });
        }

        // Usar el serializador personalizado para convertir BigInt a String
        const txStringified = JSON.stringify(tx, bigIntToString);

        // Enviar la transacción como respuesta JSON
        res.json(JSON.parse(txStringified));

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: `Error al obtener la transacción ${req.params.tx}. Detalles: ${error.message}` });
    }
});


app.get('/balance/:address', async (req, res) => {
    try {
        // Obtener el balance en wei (es un valor de tipo BigInt)
        const balance = await web3.eth.getBalance(req.params.address);

        // Convertir a ethers utilizando fromWei
        const balanceInEthers = web3.utils.fromWei(balance, 'ether');
        
        // Crear una respuesta con el balance en diferentes formatos
        const response = {
            balance, // Balance en wei
            ethers: balanceInEthers // Balance en ethers usando fromWei
        };

        // Serializar la respuesta para convertir BigInt a String si es necesario
        const responseStringified = JSON.stringify(response, bigIntToString);

        // Enviar la respuesta serializada
        res.json(JSON.parse(responseStringified));

    } catch (error) {
        res.status(500).send({ error: `Error al obtener el balance de la cuenta ${req.params.address}. Detalles: ${error.message}` });
    }
});

// Iniciar el servidor
app.listen(3333, () => {
    console.log('Server is running on http://localhost:3333');
});
