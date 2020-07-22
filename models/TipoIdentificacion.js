const mongoose = require('mongoose');

const TipoIdentificacionSchema = mongoose.Schema({
 
    descripcion: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

module.exports = mongoose.model('Tipo_Identificacion', TipoIdentificacionSchema);