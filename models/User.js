const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    identificacion: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    numero: {
        type: String,
        required: true,
        trim: true
    },

    direccion: {
        type: String,
        required: true,
        trim: true
    },

    ciudad: {
        type: String,
        required: true,
        trim: true
    },

    barrio: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    idTipoIdentificacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tipo-Identificacion'
    },
    
    idPerfil: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Perfil'
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
    },

});

module.exports = mongoose.model('User', UserSchema);