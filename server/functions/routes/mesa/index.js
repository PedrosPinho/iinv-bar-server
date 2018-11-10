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
    let produto;
    const item = request.body.item; // {id preco nome qtd}
    const ref = FBdb.ref("mesas/" + request.params.nMesa + "/produtos/" + item.id);
    FBdb.ref("mesas/" + request.params.nMesa + "/produtos").once("value")
        .then(prods => {
            if (prods.val()[item.id]) {
                produto = prods.val()[item.id];
                produto.quantidade = produto.quantidade + 1;
                console.log(produto);
            }
            return true;
        }).then(() => {
            ref.set(produto);
            return true;
        })
        .then(() => response.status(200).send({ msg: "Item adcionado" }))
        .catch(err => response.status(500).send({ err }));
});

mesa.post("/sell/:nMesa", (request, response) => {
    
});

//ta errado
mesa.delete("/remove/:nMesa/:idProd", (request, response) => {
    const ref = FBdb.ref("mesas/" + request.params.nMesa + "/produtos/" + request.params.idProd);
    let test = true;
    let produto;
    ref.once("value").then(prod => {
        produto = prod.val();
        produto.quantidade = produto.quantidade - 1;
        return true;
    }).then(() => {
        if (produto.quantidade === 0) ref.remove();
        else ref.update(produto)
        return true;
    }).then(() => response.status(200).send({ msg: "Item removido" }))
        .catch(err => response.status(500).send({ err }));
});

mesa.get("/", (request, response) => {
    FBdb.ref("mesas").once("value")
        .then(clientSnap => {
            response.status(200).send(clientSnap.val())
            return true;
        })
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
