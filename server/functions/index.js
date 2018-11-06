const functions = require('firebase-functions');

//require path to routes
const users = require('./routes/users');
const mesa = require('./routes/mesa');
const cardapio = require('./routes/cardapio');

//exports routes
/*
users - cria/deleta/altera/pega informacoes/login
cardapio - cria/deleta/altera/pega informacoes
mesa - cria/deleta
vendas - abre uma venda junto da mesa/user
*/
exports.users = functions.https.onRequest(users);
exports.mesa = functions.https.onRequest(mesa);
exports.cardapio = functions.https.onRequest(cardapio);