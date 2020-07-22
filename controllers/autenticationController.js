const {validationResult} = require('express-validator');
const {sendEmail} = require('../funciones/email');
const Seguridad = require('../models/Seguridad');
const ObjectID = require('mongodb').ObjectID;
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Metodo para iniciar sesion
exports.loginUser = async (req, res) => {

    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    //Estraemos los datos
    const {email, password} = req.body;
    
    try {
        //Validamos si existe un usuario en BD
        let user = await User.findOne({email});

        if(!user){
            return res.status(400).json({msg: 'El usuario no existe'});
        }

        //Revisar el password
        const passwordCorrecto = await bcryptjs.compare(password, user.password);

        if(!passwordCorrecto){
            return res.status(400).json({msg: 'El password es incorrecto'});
        }

        //Crear y firmar el JWT
        const payload = {
            user: {
                id: user.id,
                nombre: user.nombre,
                idPerfil: user.idPerfil,
                estado: user.estado
            }
        };

        //Firmar el jwt
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600 //Una hora
        }, (error, token) => {
            if(error) throw error;

            //Mensaje de confirmacion
            res.status(200).json({token});
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({msg: 'Hubo un error'});
    }
}

exports.userLogin = async (req, res) => {
    try {

    let users = await User.aggregate(
        [
             //Primero se filtra la llave de busqueda
             {
                $match: {
                    _id:  ObjectID(req.user.id)
                }
            },
            {
                $lookup: {
                    from: 'tipo_identificacions',
                    localField: 'idTipoIdentificacion',
                    foreignField: '_id',
                    as: 'tipoIdentificacion'
                }            
            },
            {
                $unwind: '$tipoIdentificacion' //Separa los resultados
            },
            {
                $lookup: {
                    from: 'perfils',
                    localField: 'idPerfil',
                    foreignField: '_id',
                    as: 'perfil'
                }            
            },
            {
                $unwind: '$perfil' //Separa los resultados
            },
            {
                $project: {
                    '_id': '$_id', 'nombre': '$nombre', 'identificacion': '$identificacion', 'email' : '$email', 'numero': '$numero',
                    'direccion': '$direccion', 'tipoIdentificacion': '$tipoIdentificacion.descripcion', 'perfil': '$perfil.descripcion'
                }
            }
        ],
        function(error, data){
            if(error){
                throw error;
            }

            return(data, undefined, 2)
        }
    )    
    

    users = users[0];
    res.status(200).json({users});
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.getUserEmail = async (req, res) =>{
    try {
        
        let object = await User.findOne({email: req.params.email}).select('-password');
      
        if(object){

            const {_id, nombre} = object;

            object = await Seguridad.findOne({idUser: _id, estado: 'activo'}).select('-password');

            if(!object){
                let seguridad = new Seguridad({idUser: _id});

             
    
                seguridad = await seguridad.save();

                //Enviar email
                const envio =   sendEmail(req.params.email, 
                                        'Cambiar Password', 
                                        'Sistema de Facturación', 
                                        'CambiarPassword',
                                        {name: nombre, id: seguridad._id});
            }else{
                res.status(400).send({msg: 'Usted tiene un proceso activo para cambiar password ):'});
            }
        }else{
            res.status(400).send({msg: 'Usted no esta registrado en el sistema ):'});
        }
       
        res.status(200).send({msg: 'Hemos enviado un mensaje de correo electronico a tu cuenta :)'});

    } catch (error) {
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.updateUserPassword = async (req, res) =>{
    try {

        let object = await Seguridad.findOne({_id: req.params.id});
      
        if(object){
            if(object.estado === 'activo'){
                   //Estraemos los datos
                const {password} = req.body;

                const salt = await bcryptjs.genSalt(10);
                let newPassword = await bcryptjs.hash(password, salt);

                let user = {
                        password: newPassword
                    };
            
                    //Actualizamos en password
                    user = await User.findOneAndUpdate({_id: object.idUser}, user, {new: true});

                    //Cambiamos el estado a inactivo
                    await Seguridad.findOneAndUpdate({_id: req.params.id}, {estado: 'inactivo'}, {new: true});
                    res.status(200).send({msg: 'Su cambio fue exitoso, por favor puede iniciar sesion ):'});
                }else{
                    res.status(400).send({msg: 'Este proceso ya fue realizado, por favor iniciar ):'});
                }
        }else{
            res.status(400).send({msg: 'Usted no esta registrado en el sistema ):'});
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

