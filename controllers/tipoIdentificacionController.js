const User = require('../models/User');
const {validationResult} = require('express-validator');
const TipoIdentificacion = require('../models/TipoIdentificacion');

exports.list = async (req, res) => {
    try {
        const tipoIdentificacion = await TipoIdentificacion.find();
        res.status(200).json({tipoIdentificacion});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.getId = async (req, res) => {
    try {
        const tipoIdentificacion = await TipoIdentificacion.find({_id: req.params.id});
        res.status(200).json({tipoIdentificacion});
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
    const {descripcion} = req.body;

    try {
        //Validamos si existe un usuario en BD
        let tipoIdentificacion = await TipoIdentificacion.findOne({descripcion});

        if(tipoIdentificacion){
            return res.status(400).json({msg: 'El tipo de identificación ya existe'});
        }

        //Creamos usiario con la estructura del json recibido
        tipoIdentificacion = new TipoIdentificacion(req.body);

        //Guardamos el usuario en BD
        tipoIdentificacion = await tipoIdentificacion.save();

        res.status(200).json({tipoIdentificacion});        
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
    const {descripcion} = req.body;

    try {
       const tipoIdentificacion = {
            descripcion
       };
  
       let object = await TipoIdentificacion.findOneAndUpdate({_id: req.params.id}, tipoIdentificacion, {new: true});
       res.status(200).send(object);
    } catch (error) {
       console.log(error);
       res.status(400).send('Hubo un error');
    }
}

exports.delete = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    try {    
        
    if(!errors.isEmpty()){
        res.status(400).send({errors: errors.array()})
    }else{
        let _id = req.params.id;
         //Validamos si existe un usuario en BD
        let objetc = await User.find({idTipoIdentificacion: _id});

        if(objetc.length > 0){
            res.status(300).json({msg: 'No se puede eliminar el tipo de identificación, porque esta asociado con el modulo de usuario del sistema'});
        }else{
            //Eliminar
            await TipoIdentificacion.findOneAndRemove({_id: _id});
            res.status(200).send({msg: 'Tipo Identificación eliminada correctamente'});
        }
    }        
     } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
     }
}