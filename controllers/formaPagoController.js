const {validationResult} = require('express-validator');
const FormaPago = require('../models/FormaPago');
const Factura = require('../models/Factura');

exports.list = async (req, res) => {
    try {
        const objects = await FormaPago.find();
        res.status(200).json({objects});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.getId = async (req, res) => {
    try {
        const objects = await FormaPago.findById({_id: req.params.id});
        res.status(200).json({objects});
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
        let objetc = await FormaPago.findOne({descripcion});

        if(objetc){
            return res.status(400).json({msg: 'El tipo de identificación ya existe'});
        }

        //Creamos usiario con la estructura del json recibido
        objetc = new FormaPago(req.body);

        //Guardamos el usuario en BD
        objetc = await objetc.save();

        res.status(200).json({objetc});        
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
       const formaPago = {
            descripcion
       };
  
       let object = await FormaPago.findOneAndUpdate({_id: req.params.id}, formaPago, {new: true});
       res.status(200).send(object);
    } catch (error) {
       console.log(error);
       res.status(400).send('Hubo un error');
    }
}

exports.delete = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(300).json({errors: errors.array()})
    }

    try {  
         
        let _id = req.params.id;
        //Validamos si existe un usuario en BD
        let objetc = await Factura.find({idFormaPago: _id});

       if(objetc.length > 0){
           return res.status(300).json({msg: 'No se puede eliminar la forma de pago, porque esta asociada con el modulo de facturación'});
       }       

        //Eliminar
        await FormaPago.findOneAndRemove({_id: req.params.id});
        res.status(200).send({msg: 'Forma de pago eliminada correctamente'});
     } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
     }
}