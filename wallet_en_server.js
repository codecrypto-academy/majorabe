const { Web3 } = require("web3");

const web3 = new Web3("http://localhost:9545");

async function ultimoBloque() {
    const bloque = await web3.eth.getBlockNumber(); // Corregido getBlockNumer -> getBlockNumber
    console.log(`Último bloque: ${bloque}`);
    return bloque;
}

var tx = { 
    from: "4e038bc3726d43f07fad82f9721f63f36369d015", //cuenta del nodo 1
    to: "28f683bee8a8f101e9ffa8c06eb1d43ba6d5cf06", //cuenta del nodo 2
    value: web3.utils.toWei("100", "ether"),
    gas: 21000,
    gasPrice: web3.utils.toWei("2", "gwei")
}
async function sendTransaction(){
    const tx_resul = await web3.eth.sendTransaction(tx,"123456");
    console.log(`Transacción enviada con éxito: ${tx_resul}`);
}

async function getBloque(num){
    const bloque = await web3.eth.getBlock(num);
    console.log(`Bloque numero: ${bloque}`);
}

async function getTransaction(hash){
    const txR = await web3.eth.getTransaction(hash);
    console.log(`Tx: ${txR}`);
}

async function getBalance(address){
    const balance = await web3.eth.getBalance(address);
    console.log(`Balance: ${web3.utils.fromWei(balance, "ether")}`);
}
    

ultimoBloque();
//sendTransaction();
getBloque(6);