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

users.post("/create", (request, response) => {
    const user = {
        cpf: request.body.cpf,
        nome: request.body.nome,
        type: request.body.type,
        email: request.body.email ? request.body.email : null,
        funcao: request.body.funcao ? request.body.funcao : null,
        inicio: request.body.inicio ? request.body.inicio : null
    };
    const ref = FBdb.ref("users/" + user.cpf)
    let exist = true;
    FBdb.ref("users").once("value").then(usr => {
        if (usr)
            usr.forEach(elem => {
                if (elem.val().cpf === user.cpf) exist = false;
            });
        return true;
    }).then(() => {
        if (exist) {
            ref.set(user);
            console.log("Criando usuario! " + user.cpf)
        }
        return true;
    })
        .then(() => !exist ?
            response.status(401).send({ msg: "CPF ja cadastrado" }) :
            response.status(200).send({ msg: "Usuario criado" }))
        .catch(err => response.status(500).send({ err }));
});

users.post("/login", (request, response) => {
    const cpf = request.body.cpf;
    let test = false;
    FBdb.ref("users").once("value")
        .then(usr => {
            if (usr && Object.keys(usr.val()).includes(cpf) && usr.val()[cpf].type === "funcionario") {
                console.log(cpf + " Logado com sucesso")
                FBdb.ref("users/" + cpf + "/log").push({ quando: new Date().toLocaleString() });
                test = true;
            }
            return true;
        })
        .then(() => test ? response.status(200).send({ msg: "ok" }) : response.status(401).send({ msg: "not ok" }))
        .catch(err => response.status(500).send({ err }));
});

users.post("/alter", (request, response) => {
    const user = request.body.user;
    console.log("Alterando usuario");
    FBdb.ref("users/" + user.id)
        .update({ user })
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});

users.delete("/remove", (request, response) => {
    const id = request.body.id;
    console.log("Deletando usuario");
    FBdb.ref("users/" + id)
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});

users.get("/:usrId", (request, response) => {
    FBdb.ref("users/" + request.params.usrId).once("value")
        .then(clientSnap =>{ 
            let resp = clientSnap.val();
            delete resp['log'];
            console.log(resp);
            response.status(200).send(resp)
            return true;
        })
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
