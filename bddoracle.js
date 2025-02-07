const oracledb = require('oracledb');
var pool = null;

try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_23_6' });
    console.log('Oracle Client initialized successfully');
} 
catch (err) {
    console.error('Error initializing Oracle Client:', err);
    process.exit(1);
}
async function getPool(con) {
    return new Promise(async (resolve, reject) => {
        if (pool) 
            resolve(pool);
        try {
            console.log("obtengo pool");
            pool = await oracledb.createPool(con);
            resolve(pool);
        } 
        catch (error) {
            reject(error);
        }
    });
}

async function q(sql, parametros) {
    let connection;
    try {
        await getPool({ 
            user: "c##datos", 
            password: "datos",
            connectString: "localhost:1521/XE", 
            poolAlias: "connectOracle"
        });
        connection = await oracledb.getConnection("connectOracle");
        const result = await connection.execute(sql, parametros, { outFormat: oracledb.OBJECT});  
        return (result.rows);
    } 
    catch (err) {
        return err;
    } 
    finally {
        if (connection) {
            try {
                await connection.close();
            } 
            catch (err) {
                return err;
            }
        }
    }
}

q("select * from Customers",[]).then(r =>{console.log(r)}).catch(e=>{console.log(e)});