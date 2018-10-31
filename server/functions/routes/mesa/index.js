const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { FBdb } = require("../../firebase");

//Routes handle requests 

const fetch = require('node-fetch');

// Express instance
const mesa = express();

// parse application/x-www-form-urlencoded
mesa.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
mesa.use(bodyParser.json());

mesa.post("/add/:nMesa", (request, response) => {
    const item = request.body.item; // {id preco nome qtd}
    const ref = FBdb.ref("mesa/" + request.params.nMesa + "/produtos/" + item.id);
    ref.set(item)
        .then(() => response.status(200).send({ msg: "Item adcionado" }))
        .catch(err => response.status(500).send({ err }));
});

mesa.delete("/remove/:nMesa/:idProd", (request, response) => {
    const ref = FBdb.ref("mesa/" + request.params.nMesa + "/produtos/" + request.params.idProd);
    let test = true;
    ref.once("value").then(prod => {
        if (prod.val().quantidade === 1) test = false;
        return true;
    }).catch(err => response.status(500).send({ err }));
    if (!test) ref.remove();
    else ref.update({ quantidade })
        .then(() => response.status(200).send({ msg: "Item removido" }))
        .catch(err => response.status(500).send({ err }));


});

mesa.get("/", (request, response) => {
    FBdb.ref("mesa").once("value")
        .then(clientSnap => response.status(200).send(clientSnap.val()))
        .catch(err => response.status(500).send({ err }));
});

// In case doesn't found correct endpoint
mesa.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// In case there're some kind of error in past routes
mesa.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Exporting
module.exports = mesa;
