const express = require("express");
const schedule = require("node-schedule");
const cors = require("cors");
const bodyParser = require("body-parser");
const { FBdb } = require("../../firebase");
//Routes handle requests 


// Express instance
const users = express();

// const testeSchedule = schedule.scheduledJob("*/1 * * * * *", () => {
//     console.log("eh pra funcionar porra");
// });

// const jobCreated = schedule.scheduleJob("* * */1 * * *", () => {
//     console.log("teste * * */1 * * * " + new Date());

// });

// const joAbPending0 = schedule.scheduleJobs("00 00 13 * * 1-5", () => {
//     console.log("teste S 00 00 13 * * 1-5 " + new Date());
// });

// parse application/x-www-form-urlencoded
users.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
users.use(bodyParser.json());

users.post("/create", (request, response) => {
    const user = {
        cpf: request.body.cpf,
        nome: request.body.nome,
        type: request.body.type,
        frequencia: request.body.type === "cliente" ? 0 : null,
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
        .remove()
        .then(() => response.status(200).send({ msg: "Sucesso" }))
        .catch(err => response.status(500).send({ err }));
});

users.get("/:usrId", (request, response) => {
    FBdb.ref("users/" + request.params.usrId).once("value")
        .then(clientSnap => {
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

users.post("/funcionario", (request, response) => {
    FBdb.ref("users").once("value")
        .then(clientSnap => {
            let list = [];
            clientSnap.forEach(c => {
                console.log(c.val());
                if (c.val().type !== "cliente") {
                    list.push({
                        cpf: c.val().cpf,
                        email: c.val().email,
                        nome: c.val().nome,
                        inicio: c.val().inicio,
                        funcao: c.val().funcao,
                        telefone: c.val().telefone ? c.val().telefone : null,
                    });
                }
                return false;
            })
            response.status(200).send(list)
            return true;
        })
        .catch(err => response.status(500).send({ err }));
});

users.post("/client", (request, response) => {
    FBdb.ref("users").once("value")
        .then(clientSnap => {
            let list = [];
            clientSnap.forEach(c => {
                console.log(c.val());
                if (c.val().type === "cliente") {
                    list.push({
                        cpf: c.val().cpf,
                        email: c.val().email,
                        nome: c.val().nome,
                        frequencia: c.val().frequencia,
                        telefone: c.val().telefone ? c.val().telefone : null,
                    });
                }
                return false;
            });
            response.status(200).send(list)
            return true;
        }).catch(() => response.status(500).send({ msg: "ERRO" }));
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
