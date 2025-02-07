const mysql = require('mysql8');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'majo1234',
    database: 'northwind'
});

function q(sql){
    return new Promise((resolve, reject) => {
        pool.query(sql, function(err, result, fields){
            if(err) reject(err);
            return resolve(result);  
    });
    });
}

q("select * from Customers limit 10").then(d => {
    console.log(d);
}).catch(err => {
    console.error(err);
});
