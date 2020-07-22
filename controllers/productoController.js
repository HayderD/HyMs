const User = require('../models/User');
const ObjectID = require('mongodb').ObjectID;
const Factura = require('../models/Factura');
const Producto = require('../models/Producto');
const {validationResult} = require('express-validator');
const PrecioProducto = require('../models/PrecioProducto');

const multer  = require('multer');
const path = require('path');

exports.list = async (req, res) => {
    try {

        let object = await Producto.aggregate(
            [
                // //Primero se filtra la llave de busqueda
                // {
                //     $match: {
                //         _id: ObjectID(req._id)
                //     }
                // },
                //Luego se cruza con la coleccion pertinenete con el metodo $lookup
                {
                    $lookup: {
                        from: 'precio_productos', //Nombre de la coleccion a crusar
                        localField: '_id', //Id de la coleccion origen
                        foreignField: 'idProducto', //Id de la coleccion destino
                        as: 'precioProducto' //alias como se llamara la nueva coleccion 
                    }
                },
                {
                 $unwind: '$precioProducto' //Separa los resultados
                },
                {
                    $project: {
                        _id: '$_id', nombre: '$nombre', unidad: '$unidad', valor_unitario: '$precioProducto.valor_unitario',
                        iva: '$iva', descuento: '$precioProducto.descuento', imagen: '$imagen', descripcion: '$descripcion',
                        _idPrecioProducto: '$precioProducto._id', fecha: '$precioProducto.fecha', estadoProducto: '$precioProducto.estado', 
                        estado: '$estado', idUser: '$idUser'
                    }
                },
                { $match : { estadoProducto : 'activo' } },
                //{ $sort : { fecha : -1} },
            ],
            function(error, data){
                if(error){
                    throw error;
                }
    
                return(data, undefined, 2)
            }
        )    
        
        res.status(200).json({object});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.getId = async (req, res) => {
    try {
        let object = await Producto.aggregate(
            [               
                //Luego se cruza con la coleccion pertinenete con el metodo $lookup
                {
                    $lookup: {
                        from: 'precio_productos', //Nombre de la coleccion a crusar
                        localField: '_id', //Id de la coleccion origen
                        foreignField: 'idProducto', //Id de la coleccion destino
                        as: 'precioProducto' //alias como se llamara la nueva coleccion 
                    }
                },
                {
                 $unwind: '$precioProducto' //Separa los resultados
                },
                {
                    $project: {
                        _id: '$_id', nombre: '$nombre', unidad: '$unidad', valor_unitario: '$precioProducto.valor_unitario',
                        iva: '$iva', descuento: '$precioProducto.descuento', imagen: '$imagen', descripcion: '$descripcion',
                        _idPrecioProducto: '$precioProducto._id', fecha: '$precioProducto.fecha', idUser: '$idUser', 
                        estado: '$estado',
                    }                   
                },
                 // //Primero se filtra la llave de busqueda
                 {
                    $match: {
                        _idPrecioProducto: ObjectID(req.params.id)
                    }
                }
            ],
            function(error, data){
                if(error){
                    throw error;
                }
    
                return(data, undefined, 2)
            }
        );
        
        object = object[0];
        
        res.status(200).json({object});
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

exports.add = async  (req, res, next) => {

    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    } 
    
    //Estraemos los datos
    const {nombre, descripcion, unidad, iva, idUser, valor_unitario, descuento} = req.body;
   
    try {
        //Validamos si existe un usuario en BD
        let object = await Producto.findOne({nombre});

        if(object){
            return res.status(400).json({msg: 'El nombre de producto ya existe'});
        }        

        //Creamos usiario con la estructura del json recibido
        object = new Producto({
            nombre,
            descripcion,
            unidad,
            iva,            
            idUser
        });

        if(req.file){
            const url = req.file.path.split('\\');
            object.imagen = `${url[1]}/${url[2]}/${url[3]}`;
        } 

        //Guardamos el usuario en BD
        object = await object.save();

        //Insertamos registro de precio y descuento
        object = new PrecioProducto({
            idProducto: object._id,
            valor_unitario,
            descuento,
            idUser 
        });

        //Guardamos el usuario en BD
        object = await object.save();

        res.status(200).json({object});        
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
    
}

exports.edit = async (req, res) => {
    //Revisamos si hay errores

 //Estraemos los datos
 const {descripcion, unidad, iva, idUser, valor_unitario, descuento, estado, _idPrecioProducto } = req.body;

    try {
       let object = {
        descripcion, 
        unidad,
        iva,
        estado,
        idUser
       };
  
       if(req.file){
            const url = req.file.path.split('\\');
            object.imagen = `${url[1]}/${url[2]}/${url[3]}`;
        }  

       //Actualizamos producto
       object = await Producto.findOneAndUpdate({_id: req.params.id}, object, {new: true});

       object = {
            estado: 'inactivo'
       };

       //Actualizamos precio_producto
       object = await PrecioProducto.findOneAndUpdate({_id: _idPrecioProducto}, object, {new: true});

       //Insertamos nuevo registro en precio producto
       object = new PrecioProducto({
         idProducto: req.params.id,  
        valor_unitario, 
        descuento,
        idUser
       });

       object = await object.save();

       res.status(200).send(object);
    } catch (error) {
       console.log(error);
       res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.changeState = async (req, res) => {
    try {

        let  object = {
            estado: 'inactivo'
        };

        //Actualizamos producto
        object = await Producto.findOneAndUpdate({_id: req.params.id}, object, {new: true});

        res.status(200).send(object);
     } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
     }
}