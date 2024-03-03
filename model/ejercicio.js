var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ejercicioSchema = new Schema({
    codigo: {type: String},
    nombre: {type: String},
    descripcion: {type: String}
});

ejercicioSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id,
        delete ret.__v
    }
});

module.exports = mongoose.model("ejercicio", ejercicioSchema);