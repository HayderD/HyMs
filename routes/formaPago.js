//Rutas para crear usuarios
const seguridadToken = require('../middleware/seguridadToken');
const {check} = require('express-validator');
const express = require('express');
const router = express.Router();

//Importamos controladores
const controller = require('../controllers/formaPagoController');

//Crear
// api/tipo-identificacion
router.post('/',
    seguridadToken,
    [
        check('descripcion', 'La descripción es obligatoria').not().isEmpty()   
    ],
    controller.add
);

//Listar
// api/users
router.get('/',
    seguridadToken,
    controller.list
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
        check('descripcion', 'La descripción es obligatoria').not().isEmpty()
    ],
    controller.edit
);

//Eliminar
//api/tarea
router.delete('/:id',
    seguridadToken,
    controller.delete
);

module.exports = router;