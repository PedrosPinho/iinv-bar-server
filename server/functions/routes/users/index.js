const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { FBdb } = require("../../firebase");
//Routes handle requests 

const fetch = require('node-fetch');

// Express instance
const users = express();

// parse application/x-www-form-urlencoded
users.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
users.use(bodyParser.json());

users.post("/create", (request, response) => { //tem erros de eslint fix later just a sample of the real code to gain time =)
    const user = request.body.user;
    const ref = FBdb.ref("users").push();
    let exist = true;
    FBdb.ref("users").once("value").then(usr => {
        if (usr)
            usr.forEach(elem => {
                if (elem.val().cpf === user.cpf) exist = false;
            });
        return true;
    }).then(() => {
        if (exist)
            ref.set(user);
        return true;
    })
        .then(() => response.status(200).send({ msg: !exist ? "CPF ja cadastrado" : "Usuario criado" }))
        .catch(err => response.status(500).send({ err }));
});

users.post("/login", (request, response) => {
    const id = request.body.id;
    const ref = FBdb.ref("users/" + id + "/log").push();
    ref.set({ quando: new Date().toLocaleString() })
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});

users.post("/alter", (request, response) => {
    const user = request.body.user;
    FBdb.ref("users/" + user.id)
        .update({ user })
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});

users.delete("/remove", (request, response) => {
    const id = request.body.id;
    FBdb.ref("users/" + id)
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});


users.get("/", (request, response) => {
    FBdb.ref("users").once("value")
        .then(clientSnap => response.status(200).send(clientSnap.val()))
        .catch(err => response.status(500).send({ err }));
});


// In case doesn't found correct endpoint
users.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// In case there're some kind of error in past routes
users.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Exporting
module.exports = users;
