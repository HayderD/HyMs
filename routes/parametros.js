//Rutas para crear usuarios
const seguridadToken = require('../middleware/seguridadToken');
const {check} = require('express-validator');
const express = require('express');
const router = express.Router();

//Importamos controladores
const controller = require('../controllers/parametrosController');

//Crear
// api/parametro
router.post('/',
    seguridadToken,
    [
        check('nombre', 'La descripción es obligatoria').not().isEmpty(), 
        check('valor', 'La descripción es obligatoria').not().isEmpty(),
        check('descripcion', 'La descripción es obligatoria').not().isEmpty()   
    ],
    controller.add
);

//Listar
// api/parametro
router.get('/',
    seguridadToken,
    controller.list
);

//Listar
// api/parametro/id
router.get('/:id',
    seguridadToken,
    controller.getId
);

//Actualizar
//api/parametro
router.put('/:id',
    seguridadToken, 
    [
        check('valor', 'La descripción es obligatoria').not().isEmpty(),
        check('descripcion', 'La descripción es obligatoria').not().isEmpty()
    ],
    controller.edit
);

// api/parametro
router.post('/:idUser',
    seguridadToken,
    [
        check('nombre', 'La descripción es obligatoria').not().isEmpty()   
    ],
    controller.getParameter
);

module.exports = router;