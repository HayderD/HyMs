const User = require('../models/User');
const {validationResult} = require('express-validator');
const Perfil = require('../models/Perfil');

exports.list = async (req, res) => {
    try {
        const perfils = await Perfil.find();
        res.status(200).json({perfils});
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.getId = async (req, res) => {
    try {
        const perfils = await Perfil.find({_id: req.params.id});
        res.status(200).json({perfils});
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
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
        let perfil = await Perfil.findOne({descripcion});

        if(perfil){
            return res.status(400).json({msg: 'El tipo de identificación ya existe'});
        }

        //Creamos usiario con la estructura del json recibido
        perfil = new Perfil(req.body);

        //Guardamos el usuario en BD
        perfil = await perfil.save();

        res.status(200).json({perfil});        
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
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
       const perfil = {
            descripcion
       };
  
       let object = await Perfil.findOneAndUpdate({_id: req.params.id}, perfil, {new: true});
       res.status(200).send(object);
    } catch (error) {
       console.log(error);
       res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.delete = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {    
        let _id = req.params.id;
        //Validamos si existe un usuario en BD
       let objetc = await User.find({idPerfil: _id});

       if(objetc.length > 0){
           return res.status(300).json({msg: 'No se puede eliminar el perfil, porque esta asociado al modulo usuario'});
       }

        //Eliminar
        await Perfil.findOneAndRemove({_id: _id});
        res.status(200).send({msg: 'El perfil se elimino correctamente'});
     } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
     }
}