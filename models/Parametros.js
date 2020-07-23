const mongoose = require('mongoose');

const ParametroSchema = mongoose.Schema({
 
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    valor: {
        type: String,
        required: true,
        trim: true
    },

    descripcion: {
        type: String,
        required: true,
        trim: true
    },

    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = mongoose.model('Parametro', ParametroSchema);