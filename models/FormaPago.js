const mongoose = require('mongoose');

const FormaPagoSchema = mongoose.Schema({
 
    descripcion: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

module.exports = mongoose.model('Forma-Pago', FormaPagoSchema);