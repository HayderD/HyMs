//Rutas para crear facturas
const seguridadToken = require('../middleware/seguridadToken');
const {check} = require('express-validator');
const express = require('express');
const router = express.Router();

//Importamos controladores
const controller = require('../controllers/facturaController');

//Crear
// api/factura
router.post('/',
    seguridadToken,
    [
        check('idFormaPago', 'Campo es obligatorio').not().isEmpty(),
        check('detalle', 'Campo es obligatorio').not().isEmpty()   
    ],
    controller.add
);

//Enviar por correo factura diaria
// api/factura
router.post('/:id',
    seguridadToken,
    [
        check('numero', 'Campo es obligatorio').not().isEmpty(),
        check('idUserFacturador', 'Campo es obligatorio').not().isEmpty()   
    ],
    controller.enviarFacturaDiaria
);

//Listar
// api/factura
router.get('/:fechaInicial/:fechaFinal/:idUser',
    seguridadToken,
    controller.list
);

//Listar por Id
// api/factura
router.get('/:id',
    seguridadToken,
    controller.getId
);

//Actualizar
//api/factura
router.put('/:id',
    seguridadToken,
    [
        check('idFormaPago', 'Campo es obligatorio').not().isEmpty(),
        check('detalle', 'Campo es obligatorio').not().isEmpty()      
    ],
    controller.edit
);

//Eliminar
//api/factura
router.delete('/:id',
    seguridadToken,
    controller.delete
);

module.exports = router;