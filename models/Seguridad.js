const mongoose = require('mongoose');

const SeguridadSchema = mongoose.Schema({
 
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    fecha: {
        type: Date,
        default: Date.now()
    },

    estado: {
        type: String,
        default: 'activo'
    }
});

module.exports = mongoose.model('Seguridad', SeguridadSchema);