var modelEntrenamiento = require("../model/entrenamiento");

exports.findAll = function(req, res) {
    let where = {};
    if (req.query) {
        const hoy = new Date();
        let anio = hoy.getFullYear();
        if (req.query.anio)
            anio = req.query.anio;
        let mes = hoy.getMonth()+1;
        if (req.query.mes)
            mes = req.query.mes;
        const firstDay = new Date(anio,mes-1,1).setUTCHours(0);
        const lastDay = new Date(anio,mes,0).setUTCHours(0);
        where = {
            $and : [
                {fecha: {$gte:firstDay}},
                {fecha: {$lte:lastDay}}
            ]
        }        
    }
    modelEntrenamiento
        .find(where)
        .populate("ejercicios.ejercicio")
        .exec(function(err, entrenamientos) {
            if (err)
                res.send(500, err.message);
            console.log("Obteniendo entrenamientos");
            res.status(200).jsonp(entrenamientos);
        });
};

exports.findById = function(req, res) {
    modelEntrenamiento.findById(req.params.id)
    //.populate("ejercicios.ejercicio")
    .exec(function(err, entrenamiento) {
        if (err)
            res.send(500, err.message);
        if (entrenamiento==null) {
            res.status(404).send("Entrenamiento no encontrado");
        } else {
            console.log(`obteniendo entrenamiento con id ${req.params.id}`);
            res.status(200).jsonp(entrenamiento);
        }
    });
};

var validate = (body) => {
    if (body.fecha==null || body.fecha=='') {
        return "Debe indicar una fecha";
    }
    if (body.numero==null || body.numero=='') {
        return "Debe indicar el número de entrenamiento";
    }
    if (body.tipo==null || body.tipo=='') {
        return "Debe indicar un tipo de entrenamiento";
    }
    if (body.ejercicios==null || body.ejercicios.length==0) {
        return "Debe indicar los ejercicios realizados";
    } else {
        let i = 1;
        for (const ejer of body.ejercicios) {
            if (ejer.ejercicio==null || ejer.ejercicio == '') {
                return `Debe indicar el ejercicio en línea ${i}`;
            }
            if (ejer.series==null || ejer.series.length==0) {
                return `Debe indicar series en línea ${i}`;
            }
            if (ejer.unidad==null || ejer.unidad=='') {
                return `Debe indicar unidad en línea ${i}`;
            } else if(ejer.unidad!='Rep' && ejer.unidad!='Seg') {
                return `Debe indicar unidad válida en línea ${i}`;
            }
            i++;
        }
    }
}

exports.create = function(req, res) {
    
    var msg = validate(req.body);
    if (msg) {
        res.status(400).send(msg);
        return
    }
        
    var entrenamiento = new modelEntrenamiento({
        fecha: req.body.fecha,
        numero: req.body.numero,
        tipo: req.body.tipo,
        observacion: req.body.observacion,
        duracionMinutos: req.body.duracionMinutos,
        ejercicios: req.body.ejercicios
    });

    entrenamiento.save(function (err, entrenamiento) {
        if (err)
            res.status(500).send(err.message);
        console.log("Creando entrenamiento");
        res.status(200).jsonp(entrenamiento);
    });
};

exports.update = function(req, res) {

    modelEntrenamiento.findById(req.params.id)
    .populate("ejercicios.ejercicio")
    .exec(function(err, entrenamiento) {
        if (err)
            res.status(500).jsonp(err.message);
        if (entrenamiento==null) {
            res.status(404).send("Entrenamiento no encontrado");
        } else {
            var msg = validate(req.body);
            if (msg) {
                res.status(400).send(msg);
                return
            }
            
            entrenamiento.numero = req.body.numero;
            entrenamiento.fecha = req.body.fecha;
            entrenamiento.tipo = req.body.tipo;
            entrenamiento.observacion = req.body.observacion;
            entrenamiento.duracionMinutos = req.body.duracionMinutos;
            entrenamiento.ejercicios = req.body.ejercicios;
            
            entrenamiento.save(function (err, entrenamiento) {
                if (err)
                    res.status(500).send(err.message);
                console.log(`Actualizando entrenamiento con id ${req.params.id}`);
                res.status(200).jsonp(entrenamiento);
            });
        }
    });
    
};

exports.delete = function(req, res) {

    modelEntrenamiento.findById(req.params.id, function(err, entrenamiento) {
        if (err)
            res.status(500).jsonp(err.message);
        if (entrenamiento==null) {
            res.status(404).send("Entrenamiento no encontrado");
            return;
        } else {
            entrenamiento.remove(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                } else {
                    console.log(`Borrando entrenamiento con id ${req.params.id}`);
                    return res.status(200).jsonp(entrenamiento);
                }
            });
        }
    });
};