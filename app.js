// Utilizar funcionalidades del Ecmascript 6
'use strict'

var express = require("express");
var mongoose = require("mongoose");
var app = express();
var cors = require('cors');
var bodyParser = require("body-parser");
var ejerciciosController = require("./controller/ejercicios");
var entrenamientosController = require("./controller/entrenamientos");

app.use(cors());
app.use(bodyParser.json());

var router = express.Router();

router.route("/ejercicios")
    .get(ejerciciosController.findAll)
    .post(ejerciciosController.create);
router.route("/ejercicios/:id")
    .get(ejerciciosController.findById)
    .put(ejerciciosController.update)
    .delete(ejerciciosController.delete);
router.route("/entrenamientos")
    .get(entrenamientosController.findAll)
    .post(entrenamientosController.create);
router.route("/entrenamientos/:id")
    .get(entrenamientosController.findById)
    .put(entrenamientosController.update)
    .delete(entrenamientosController.delete);

app.use(router);

app.get("/", function(req, res) {
    res.send("Bienvenido a la api de entreno");
});

const connectDB = async function(uri) {
    const options = {
    }
    const db = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/entreno", options);
    console.log("Conectado a db: ",db.connection.name);//.databaseName
    console.log("Api de entreno corriendo en http://localhost:3001");
} 

require('dotenv').config();
console.log(process.env.MONGODB_URI);
connectDB(process.env.MONGODB_URI);
app.listen(process.env.PORT || 3001, function() {
    console.log("Api de entreno corriendo en http://localhost:3001");
});
/*mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/entreno", function(err, res) {
    if (err) {
        console.log(`Error conectando a la base de datos entreno. Err: ${err}`);
    }   
    app.listen(process.env.PORT || 3001, function() {
        console.log("Conectado a db: ",res.db.databaseName);
        console.log("Api de entreno corriendo en http://localhost:3001");
    });
});*/
