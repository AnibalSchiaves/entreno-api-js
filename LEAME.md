# Entreno Api

Api para aplicación de entrenamiento realizada con Express y Mongodb

## Prerequisitos

Instale MongoDB

```bash
sudo apt install mongodb-server
```

Chequeo de version

```bash
mongod --version
```
## Lección 1

Creamos el directorio api y nos posicionamos en el mismo

```bash
mkdir api
cd api
```

Inicializo el proyecto de la api indicando propiedades generales, el resultado es el archivo package.json

```bash
npm init
```

Edito package.json para agregar las dependencias del proyecto:

```json
"dependencies": {
 "mongoose": "~3.6.11",
 "express": "^4.7.1",
 "method-override": "^2.1.2",
 "body-parser": "^1.5.1"
}
```
Para descargar las dependencias, así como las dependencias de las dependencias, alojándolas en el directorio node_modules. Si el comando anterior indica que existen vulnerabilidades entonces ejecutar el siguiente comando:

```bash
npm install
```

Luego de instalar me indica problemas de vulnerabilidades, para chequear en detalle las mismas se ejecuta:

```bash
npm audit
```

Allí me indica los problemas de vulnerabilidades y me sugiere hacer: Run  npm install mongoose@6.0.8  to resolve 7 vulnerabilities

```bash
npm install mongoose@6.0.8
```

Vamos ahora a crear el archivo app.js con el siguiente código:

```js
var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send("Bienvenido a la api de entreno");
});

app.listen(3000, function() {
    console.log("Api de entreno corriendo en http://localhost:3000");
});
```

Para levantar la api ejecutamos:

```bash
nodejs app.js
```

Si ahora abrimos el navegador y ponemos la url http://localhost:3000 veremos el mensaje de bienvenida de la api.

## Lección 2

Vamos a crear un modelo usando mongoose que nos permitirá persistir los datos relacionados a ejercicios de la api de entrenamiento. Los datos serán almacenados en la base de datos mongodb que es una base de datos NoSQL orientada a documentos JSON.

En primer lugar creamos la carpeta model donde alojaremos todos los archivos de modelos

```bash
mkdir model
```

Dentro de la carpeta model creamos el archivo ejercicio.js con el siguiente código:

```js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ejercicioSchema = new Schema({
    codigo: {type: String},
    nombre: {type: String},
    descripcion: {type: String}
});

module.exports = mongoose.model("ejercicio", ejercicioSchema);
```

Ahora vamos a implentar la conexión a la base de datos en el archivo app.js para lo cual agregamos en la línea 2:

```js
var mongoose = require("mongoose");
```

Y reestructuramos la parte del app.listen de la siguiente manera:

```js
mongoose.connect("mongodb://localhost/entreno", function(err, res) {
    if (err) {
        console.log(`Error conectando a la base de datos entreno. Err: ${err}`);
    }   
    app.listen(3000, function() {
        console.log("Api de entreno corriendo en http://localhost:3000");
    });
});
```

Al ejecutar la api con nodejs se me presentó un error de sintaxis en la línea 46 del archivo node_modules/mongodb/lib/cursor/abstract_cursor.js. Aparentemente hay alguna incompatibilidad con la versión 6 de mongoose y, quizás nuestro versión de node. Decidí entonces hacer un downgrade de la versión de mongoose quedando mis dependencias en package.json de la siguiente forma:

```js
"dependencies": {
    "body-parser": "^1.5.1",
    "express": "^4.7.1",
    "method-override": "^2.1.2",
    "mongoose": "^5.0.1"
}
```
Borré la carpeta node_modules y voví a ejecutar 

```bash
npm install
```

Con dicha versión, a pesar de tener vulnerabilidades, dejó de presentarse el error de sintaxis al ejecutar la api

A continuación crearemos los controladores que manejarán las peticiones que arriben a la api, para ello creamos la carpeta controller

```bash
mkdir controller
```

Y dentro de esta carpeta crearemos el archivo ejercicios.js con el siguiente código:

```js
var mongoose = require("mongoose");
var modelEjercicio = require("../model/ejercicio");

exports.findAll = function(req, res) {
    modelEjercicio.find(function(err, ejercicios) {
        if (err)
            res.send(500, err.message);
        console.log("Obteniendo ejercicios");
        res.status(200).jsonp(ejercicios);
    });
};

exports.findById = function(req, res) {
    modelEjercicio.findById(req.params.id, function(err, ejercicio) {
        if (err)
            res.send(500, err.message);
        console.log(`obteniendo ejercicio con id ${req.params.id}`);
        res.status(200).jsonp(ejercicio);
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
```

Como se observa hemos creado una función para recuperar todos los ejercicios, otra función para recuperar un ejercicio a partir de su id y, finalmente, una función para crear nuevos ejercicios. Para poder hacer uso de nuestras funciones de controller modificaremos el archivo app.js de la siguiente forma:

```bash
// Utilizar funcionalidades del Ecmascript 6
'use strict'

var express = require("express");
var mongoose = require("mongoose");
var app = express();
var bodyParser = require("body-parser");
var ejerciciosController = require("./controller/ejercicios");

app.use(bodyParser.json());

var router = express.Router();

router.route("/ejercicios")
    .get(ejerciciosController.findAll)
    .post(ejerciciosController.create);
router.route("/ejercicios/:id")
    .get(ejerciciosController.findById);

app.use(router);

app.get("/", function(req, res) {
    res.send("Bienvenido a la api de entreno");
});

mongoose.connect("mongodb://localhost/entreno", function(err, res) {
    if (err) {
        console.log(`Error conectando a la base de datos entreno. Err: ${err}`);
    }   
    app.listen(3000, function() {
        console.log("Api de entreno corriendo en http://localhost:3000");
    });
});
```

Ahora, al levantar la api, podremos realizar las operaciones de POST a la url http://localhost:3000/ejercicios para crear nuevos ejercicios, y los GETs para recuperar todos los ejercicios y un ejercicio puntual a las urls http://localhost:3000/ejercicios y http://localhost:3000/ejercicios/:id respectivamente.

## Lección 3

Ahora vamos a completar nuestro controller de ejercicios para agregar las funiones que nos permitirán realizar actualizaciones y borrados de ejercicios ya creados. Pero previamente a eso vamos a mejorar la función findById para devolver error 404 si no encuentra el ejercicio que se busca. Para ello modificamos la función de la siguiente manera:

```bash
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
```

A continuación vamos a agregar al final de nuestro archivo ejercicios.js las funciones que nos permitiran realizar actualizaciones y borrados:

```bash
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
```

Y ahora tenemos que agregar las funciones a la ruta correspondiente en el archivo app.js, para ello modificamos la ruta "/ejercicios/:id" agregando los métodos PUT y DELETE de la siguiente forma:

```bash
router.route("/ejercicios/:id")
    .get(ejerciciosController.findById)
    .put(ejerciciosController.update)
    .delete(ejerciciosController.delete);

```

## Lección 4

Ahora continuaremos con las rutas de la api que nos permitirán manipular las sesiones de entrenamiento. Para esto comenzaremos creando el modelo. En la carpeta model creamos el archivo entrenamiento.js con el siguiente código:

```js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ejercicioRealizadoSchema = new Schema({
    ejercicio: {type: Schema.Types.ObjectId, ref: 'ejercicio'},
    series: [Number],
    unidad: {type: String, enum:['Rep','Seg'], default: "Rep"}
});

ejercicioRealizadoSchema.virtual("volumen").get(function() {
    var volumen = 0;
    for (let serie of this.series) {
        volumen += serie;
    }
    return volumen;
});

ejercicioRealizadoSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id,
        delete ret.__v
    }
});

var entrenamientoSchema = new Schema({
    fecha: {type : Date},
    numero: {type: Number},
    tipo: {type : String},
    observacion: {type : String},
    duracionMinutos: {type : Number},
    ejercicios: [ ejercicioRealizadoSchema]
});

entrenamientoSchema.virtual("volumenTotal").get(function() {
    var total = 0;
    for (let ejer of this.ejercicios) {
        total += ejer.volumen;
    }
    return total;
});

entrenamientoSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id,
        delete ret.__v
    }
});

module.exports = mongoose.model("entrenamiento", entrenamientoSchema);
```

Algunas cuestiones a destacar con respecto a este modelo son:


a- el atributo ejercicio en ejercicioRealizadoSchema fue definido con el tipo Schema.Types.ObjectId y al atributo ref con el valor 'ejercicio' para que sea un atributo que tenga una referencia a una instancia del modelo de ejercicio.


b- se definieron atributos virtuales a través de la función virtual() de los correspondientes schemas, de esta forma podemos definir atributos calculados que no se almacenan en mongodb.


c- se parametriza algunos aspectos de la función toJSON de los modelos. Esta función es la que convierte las instancias de los modelos en objetos json. Indicando virtuals en true hacemos que se lleven los atributos calculados al objeto json (y por ende a las respuestas de la api) y con la definición de la función transforms indicamos que no se transladen los atributos _id y __v a los json de respuesta.


Lo mencionado en el punto c también lo reflejaremos en el modelo de ejercicio, para ello agregamos el siguiente código en el archivo ejercicio.js:


```js
ejercicioSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id,
        delete ret.__v
    }
});
```


A continuación seguimos con la creación del controlador que nos permitirá manipular las peticiones relacionadas a los entrenamientos. Para ello creamos el archivo entrenamientos.js dentro de la carpeta controller con el siguiente código:


```js
var modelEntrenamiento = require("../model/entrenamiento");

exports.findAll = function(req, res) {
    modelEntrenamiento
        .find({})
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
    .populate("ejercicios.ejercicio")
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
```

También aquí tenemos un elemento nuevo, que es el uso del método populate(), a través del cual podemos hacer que nuestro atributo ejercicio se complete con la instancia del ejercicio al cual hace referencia el objectId que almacena.


Para finalizar con la lección agregamos las rutas que manejaran las operaciones sobre la entidad entrenamiento. Para ello agregamos al archivo app.js el siguiente código:


```js
var entrenamientosController = require("./controller/entrenamientos");

[...]

router.route("/entrenamientos")
    .get(entrenamientosController.findAll)
    .post(entrenamientosController.create);
router.route("/entrenamientos/:id")
    .get(entrenamientosController.findById)
    .put(entrenamientosController.update)
    .delete(entrenamientosController.delete);
```


## Referencias

https://carlosazaustre.es/como-crear-una-api-rest-usando-node-js

https://medium.com/williambastidasblog/estructura-de-una-api-rest-con-nodejs-express-y-mongodb-cdd97637b18b

https://mongoosejs.com/docs/5.x/docs/guide.html