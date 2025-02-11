const express = require('express');
const cors = require('cors');
const app = express();
const puerto = 5555;
const db = require('./db.js');
app.use(cors());

app.get('/ping', async(req, res) => {
    res.send({ fecha: new Date().toISOString() })
});

app.get('/productos', async(req, res) => {
    try{
        const [results, fields] = await db.q("select * from Products " );
        res.send(results);
    }
    catch(error){
        res.send({ error: error.message });
    }
});

app.get('/productos/:id', async(req, res) => {
    try{
        const [results, fields] = await db.q(`select * from Products where ProductID = ${req.params.id}`);
        res.send(results);
    }
    catch(error){
        res.send({ error: error.message });
    }
});



app.listen(puerto, () => {
    console.log(`Server corriendo en el puerto ${puerto}`);
});