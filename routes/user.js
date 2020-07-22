//Rutas para crear usuarios
const seguridadToken = require('../middleware/seguridadToken');
const {check} = require('express-validator');
const express = require('express');
const router = express.Router();

//Importamos controladores
const controller = require('../controllers/userController');

//Crear
// api/users
router.post('/', 
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('identificacion', 'La identificacion es obligatoria').not().isEmpty(),        
        check('email', 'agregar un email valido').isEmail(),        
        check('numero', 'El numero de contacto es obligatorio').not().isEmpty(),
        check('direccion', 'La dirección de contacto es obligatoria').not().isEmpty(),
        check('password', 'El password debe ser minimo de 6 caracteres').isLength({min: 6}),
        check('idTipoIdentificacion', 'El tipo de identificaón es obligatoria').not().isEmpty(),
        check('idPerfil', 'El perfil de usuario es obligatorio').not().isEmpty()    
    ],
    controller.addUser
);

//Listar
// api/users
router.get('/',
    seguridadToken,
    controller.listUser
);

//Listar
// api/users
router.get('/:id',
    seguridadToken,
    controller.getId
);

//Actualizar
//api/users
router.put('/:id',
    seguridadToken, 
    [
        check('numero', 'El numero de contacto es obligatorio').not().isEmpty(),
        check('direccion', 'La dirección de contacto es obligatoria').not().isEmpty()
    ],
    controller.editUser
);

//Eliminar
//api/tarea
router.delete('/:id',
    seguridadToken,
    controller.deleteUser
);

module.exports = router;