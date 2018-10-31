const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { FBdb } = require("../../firebase");

//Routes handle requests 

const fetch = require('node-fetch');

// Express instance
const cardapio = express();

// parse application/x-www-form-urlencoded
cardapio.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
cardapio.use(bodyParser.json());

cardapio.post("/create", (request, response) => {
    const ref = FBdb.ref("cardapio").push();
    const item = {
        nome: request.body.nome,
        preco: request.body.preco,
        descricao: request.body.descricao,
        id: ref.key
    };
    ref.set(item)
        .then(() => response.status(200).send({ msg: "Item adcionado" }))
        .catch(err => response.status(500).send({ err }));
});

cardapio.post("/alter", (request, response) => {
    const ref = FBdb.ref("cardapio/" + request.body.id);
    ref.update(item)
        .then(() => response.status(200).send({ msg: "Item alterado" }))
        .catch(err => response.status(500).send({ err }));
});

cardapio.delete("/remove", (request, response) => {
    const ref = FBdb.ref("cardapio/" + request.body.id);
    ref.remove()
        .then(() => response.status(200).send({ msg: "Item removido" }))
        .catch(err => response.status(500).send({ err }));
});

cardapio.get("/", (request, response) => {
    FBdb.ref("cardapio").once("value")
        .then(clientSnap => {
            let list = [];
            clientSnap.forEach(a => { 
                list.push(a.val());
            });
            console.log(list);
            response.status(200).send(list)
            return true;
        })
        .catch(err => response.status(500).send({ err }));
});

// In case doesn't found correct endpoint
cardapio.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// In case there're some kind of error in past routes
cardapio.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Exporting
module.exports = cardapio;
