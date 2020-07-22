const User = require('../models/User');
const {validationResult} = require('express-validator');
const Parametros = require('../models/Parametros');

exports.list = async (req, res) => {
    try {
        const object = await Parametros.find();
        res.status(200).json({object});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.getId = async (req, res) => {
    try {
        const object = await Parametros.find({_id: req.params.id});
        res.status(200).json({object});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.getParameter = async (req, res) => {
    try {
        const {nombre} = req.body;

        const object = await Parametros.find({'nombre': nombre, 'idUser': req.params.idUser});

        res.status(200).json({object});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.add = async (req, res) => {

    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    //Estraemos los datos
    const {valor} = req.body;

    try {
        //Validamos si existe un usuario en BD
        let object = await Parametros.findOne({valor});

        if(object){
            return res.status(400).json({msg: 'El tipo de identificación ya existe'});
        }

        //Creamos usiario con la estructura del json recibido
        object = new Parametros(req.body);

        //Guardamos el usuario en BD
        object = await object.save();

        res.status(200).json({object});        
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
    
}

exports.edit = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    //Estraemos los datos
    const {valor, descripcion} = req.body;

    try {
       let object = {
           valor,
            descripcion
       };
  
       object = await Parametros.findOneAndUpdate({_id: req.params.id}, object, {new: true});
       res.status(200).send(object);
    } catch (error) {
       console.log(error);
       res.status(400).send('Hubo un error');
    }
}
