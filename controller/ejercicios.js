var mongoose = require("mongoose");
var modelEjercicio = require("../model/ejercicio");

exports.findAll = function(req, res) {
    console.log(modelEjercicio);
    modelEjercicio.find(function(err, ejercicios) {
        if (err)
            res.status(500).send(err.message);
        console.log("Obteniendo ejercicios");
        res.header("Access-Control-Allow-Origin","*");
        res.status(200).jsonp(ejercicios);
    });
};

exports.findById = function(req, res) {
    modelEjercicio.findById(req.params.id, function(err, ejercicio) {
        if (err)
            res.send(500, err.message);
        if (ejercicio==null) {
            res.status(404).send("Ejercicio no encontrado");
        } else {
            console.log(`obteniendo ejercicio con id ${req.params.id}`);
            res.status(200).jsonp(ejercicio);
        }
    });
};

var validate = (body) => {
    if (body.codigo==null || body.codigo=='') {
        return "Debe indicar un código";
    }
    if (body.nombre==null || body.nombre=='') {
        return "Debe indicar un nombre";
    }
}

exports.create = function(req, res) {
    res.header("Access-Control-Allow-Origin","*");
    var msg = validate(req.body);
    if (msg) {
        res.status(400).send(msg);
        return
    }
        
    var ejecicio = new modelEjercicio({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion
    });

    ejecicio.save(function (err, ejercicio) {
        if (err)
            res.status(500).send(err.message);
        console.log("Creando ejercicio");
        res.status(200).jsonp(ejercicio);
    });
};

exports.update = function(req, res) {

    modelEjercicio.findById(req.params.id, function(err, ejercicio) {
        if (err)
            res.status(500).jsonp(err.message);
        if (ejercicio==null) {
            res.status(404).send("Ejercicio no encontrado");
        } else {
            var msg = validate(req.body);
            if (msg) {
                res.status(400).send(msg);
                return
            }
            
            ejercicio.codigo = req.body.codigo;
            ejercicio.nombre = req.body.nombre;
            ejercicio.descripcion = req.body.descripcion;
            
            ejercicio.save(function (err, ejercicio) {
                if (err)
                    res.status(500).send(err.message);
                console.log(`Actualizando ejercicio con id ${req.params.id}`);
                res.status(200).jsonp(ejercicio);
            });
        }
    });
    
};

exports.delete = function(req, res) {

    modelEjercicio.findById(req.params.id, function(err, ejercicio) {
        if (err)
            res.status(500).jsonp(err.message);
        if (ejercicio==null) {
            res.status(404).send("Ejercicio no encontrado");
        } else {
            ejercicio.remove(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                } else {
                    console.log(`Borrando ejercicio con id ${req.params.id}`);
                    return res.status(200).jsonp(ejercicio);
                }
            });
        }
    });
};