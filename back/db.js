const mysql = require('mysql8');

const pool = new mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost',
    port: 3307,
    database: 'northwind',
    user: 'root',
    password: 'mysecret-pw'
});

function q(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, function (error, results, fields){
            if (error) 
                reject(error);
            else 
                resolve([results, fields]);
        });
    });
}

module.exports = {
    q
};