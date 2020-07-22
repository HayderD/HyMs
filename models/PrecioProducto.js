const mongoose = require('mongoose');

const PrecioProductoSchema = mongoose.Schema({
 
    idProducto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    },

    valor_unitario: {
        type: Number,
        required: true,
        trim: true
    },    

    descuento: {
        type: Number,
        trim: true,
        default: 0
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

module.exports = mongoose.model('Precio_Producto', PrecioProductoSchema);