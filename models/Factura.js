const mongoose = require('mongoose');

const FacturaSchema = mongoose.Schema({
    numero: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    idUserFacturador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    idFormaPago: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forma-Pago'
    },

    detalle: [{
                
        idProducto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        },

        nombre: {
            type: String,
            trim: true,
        }, 

        iva: {
            type: Number,
            trim: true,
        }, 

        descuento: {
            type: Number,
            trim: true,
        }, 

        valor_unitario: {
            type: Number,
            trim: true,
        }, 
        
        cantidad: {
            type: Number,
            trim: true 
        },

        valor_total: {
            type: Number,
            trim: true,
        }
    }],

    fecha: {
        type: Date,
        default: Date.now()
    },

    estado: {
        type: String,
        default: 'activo'
    },
});



module.exports = mongoose.model('Factura', FacturaSchema);