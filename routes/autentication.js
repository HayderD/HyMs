//Rutas para crear usuarios
const express = require('express');
const router = express.Router();
const {check} = require('express-validator');

const seguridadToken = require('../middleware/seguridadToken');


//Importamos controladores
const controller = require('../controllers/autenticationController');

//Login
// api/autentication
router.post('/',
    [
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('password', 'El password es obligatorio').not().isEmpty()
    ],
    controller.loginUser
);

//Login
// api/autentication
router.post('/:id',
    [
        check('password', 'El password es obligatorio').not().isEmpty()
    ],
    controller.updateUserPassword
);

//Obtener user
//api/autentication
router.get('/', 
    seguridadToken,
    controller.userLogin
);

//Listar
// api/users
router.get('/:email',
    controller.getUserEmail
);

module.exports = router;