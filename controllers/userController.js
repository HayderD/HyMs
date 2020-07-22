const {validationResult} = require('express-validator');
const ObjectID = require('mongodb').ObjectID;
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.addUser = async (req, res) => {
    console.log(req.body);

    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(400).json({errors: errors.array()})
    }
    
    //Estraemos los datos
    const {email, password, identificacion} = req.body;

    try {
        //Validamos si existe un usuario en BD
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({msg: 'El usuario ya existe'});
        }

        if(identificacion){
            //Validamos si existe un usuario en BD
            user = await User.findOne({identificacion});

            if(user){
                return res.status(400).json({msg: 'El usuario ya existe'});
            }
        }        

        //Creamos usiario con la estructura del json recibido
        user = new User(req.body);

        if(user.idPerfil !== '5ecc10772792ee32e8f70242'){
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);
        }else{
            user.password = '';
        }

        //Guardamos el usuario en BD
       await user.save();

        if(user.idPerfil !== '5ecc10772792ee32e8f70242'){
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
        }else{
            res.status(200).json({user});  
        }    
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.listUser = async (req, res) => {
    try {
        const users = await User.aggregate(
            [
                 //Primero se filtra la llave de busqueda                 
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
                        _id: '$_id', nombre: '$nombre', identificacion: '$identificacion', email : '$email', numero: '$numero',
                        direccion: '$direccion', ciudad: '$ciudad', barrio: '$barrio', tipoIdentificacion: '$tipoIdentificacion.descripcion', perfil: '$perfil.descripcion', 
                        estado: '$estado'                        
                    }
                }
            ],
            function(error, data){
                if(error){
                    throw error;
                }
    
                //console.log(JSON.stringify(data, undefined, 2))
            }
        )    ;
        res.status(200).json({users});
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.getId = async (req, res) => {
    try {

    let users = await User.aggregate(
        [
             //Primero se filtra la llave de busqueda
             {
                $match: {
                    _id:  ObjectID(req.params.id)
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
                    _id: '$_id', nombre: '$nombre', identificacion: '$identificacion', email : '$email', numero: '$numero',
                    direccion: '$direccion', ciudad: '$ciudad', barrio: '$barrio', tipoIdentificacion: '$tipoIdentificacion.descripcion', 
                    perfil: '$perfil.descripcion', idPerfil: '$perfil._id', idTipoIdentificacion: '$tipoIdentificacion._id', estado: '$estado'
                }
            }
        ],
        function(error, data){
            if(error){
                throw error;
            }
        }
    );   

    users = users[0];

    res.status(200).json({users});
    } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
    }
}

exports.editUser = async (req, res) => {
     //Revisamos si hay errores
     const errors = validationResult(req);

     if(!errors.isEmpty()){
         return res.status(400).json({errors: errors.array()})
     }
     try {
     //Estraemos los datos
     const {nombre, email, identificacion, numero, direccion, idTipoIdentificacion, estado} = req.body;

    //Validamos si existe un usuario en BD
    let user = await User.findOne({email});

  if(user) { 
      if(user._id != req.params.id){
        return res.status(400).json({msg: 'El usuario ya existe'});
        }
    }
     
    user = await User.findOne({identificacion});

    if(user) {
        if(user._id != req.params.id){
            return res.status(400).json({msg: 'El usuario ya existe'});
        }
    }
    
        user = {
            nombre,
            email,
            idTipoIdentificacion,
            identificacion,
            numero,
            direccion,
            estado
        };
   
        let userEdit = await User.findOneAndUpdate({_id: req.params.id}, user, {new: true});
        res.status(200).send(userEdit);
     } catch (error) {
        console.log(error);
        res.status(400).send({msg: 'Hubo un error'});
     }
}

exports.deleteUser = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {    
        //Eliminar
        await User.findOneAndRemove({_id: req.params.id});
        res.status(200).send({msg: 'Usuario eliminado correctamente'});
     } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
     }
}