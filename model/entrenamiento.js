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