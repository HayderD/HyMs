const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    descripcion: {
        type: String,
        trim: true        
    },

    unidad: {
        type: String,
        trim: true
    },

    iva: {
        type: Number,
        trim: true,
        default: 0
    },

    imagen: {
        type: String,
        trim: true,
        default: '\\img\\falta.png'
    },

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

module.exports = mongoose.model('Producto', ProductoSchema);