const { Pool } = require('pg');

// Configuración de la conexión a la base de datos
const poolPg = new Pool({
    user: 'postgres',
    password: 'Majo1234',
    host: 'localhost',
    port: 5433,
    database: 'postgres',
});

async function q(sql, parametros) {
    const client = await poolPg.connect(); // Obtiene el cliente de manera asincrónica
    try {
        // Ejecuta la consulta SQL con parámetros y devuelve los resultados
        const result = await client.query(sql, parametros);
        return result.rows;
    } 
    catch (err) {
        throw err; // Lanza el error si ocurre
    } 
    finally {
        client.release(); // Libera la conexión después de la consulta
    }
}

q("SELECT * FROM Customers", []).then(r =>{console.log(r)}).catch(e=>{console.log(e)});