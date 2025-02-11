
export async function getBlock(bloque) {
    //console.log(bloque.queryKey[1]);
    const response = await fetch(`http://localhost:3333/bloque/${bloque.queryKey[1]}`);
    
    // Validar que la respuesta sea exitosa antes de convertir a JSON
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}


export async function getTx(tx) {

    const response = await fetch(`http://localhost:3333/tx/${tx.queryKey[1]}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}



export async function getBalance(balance) {

    const response = await fetch(`http://localhost:3333/balance/${balance.queryKey[1]}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
