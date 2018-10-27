const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Creating firebase instance
const firebase = admin.initializeApp(functions.config().config);

//MUST ADD FIREBASE PROJECT
exports.FBdb = firebase.database("https://iinv-bar.firebaseio.com/");