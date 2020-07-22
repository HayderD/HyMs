const mongoose = require('mongoose');

const PerfilSchema = mongoose.Schema({
 
    descripcion: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

module.exports = mongoose.model('Perfil', PerfilSchema);