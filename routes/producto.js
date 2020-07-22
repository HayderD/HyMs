//Rutas para crear usuarios
const seguridadToken = require('../middleware/seguridadToken');
const uploadController = require('../controllers/uploadController');
const {check} = require('express-validator');
const express = require('express');
const router = express.Router();


//Importamos controladores
const controller = require('../controllers/productoController');




//Crear
// api/producto
router.post('/:id',    
    seguridadToken,
    uploadController.upload.single('imagen'),  
    [
        check('nombre', 'Campo es obligatorio').not().isEmpty(),
        check('valor_unitario', 'Campo es obligatorio').not().isEmpty()     
    ],
    controller.add
);

//Listar
// api/producto
router.get('/',
    seguridadToken,
    controller.list
);

//Listar
// api/producto/id
router.get('/:id',
    seguridadToken,
    controller.getId
);

//Actualizar
//api/producto
router.put('/:id',
    seguridadToken,
    uploadController.upload.single('imagen'),  
    [
        check('nombre', 'Campo es obligatorio').not().isEmpty(),
        check('valor_unitario', 'Campo es obligatorio').not().isEmpty()     
    ],
    controller.edit
);

//Eliminar
//api/producto
router.put('/:id',
    seguridadToken,
    controller.changeState
);

module.exports = router;