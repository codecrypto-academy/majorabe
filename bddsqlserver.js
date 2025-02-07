const mssql = require('mssql');

const sqlConfig = {
        user: "sa", 
        password: "Majo1234", 
        database: "Northwind", 
        server: "localhost", 
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, 
            trustServerCertificate: true
        }
 }
 async function q(sql) {
    try {
        await mssql.connect(sqlConfig);
        const result = await mssql.query(sql);
        return result;
        } 
    catch (err) {
        return {err:JSON.stringify(err)}
        }
}

q("select * from Customers").then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});