db.users.aggregate(
    [
        //Primero se filtra la llave de busqueda
        {
            $match: {
                idTipoIdentificacion: ObjectId('5ec7e435a403900584a33785')
            }
        },
        //Luego se cruza con la coleccion pertinenete con el metodo $lookup
        {
            $lookup: {
                from: 'tipo-identificacions', //Nombre de la coleccion a crusar
                localField: 'idTipoIdentificacion', //Id de la coleccion origen
                foreignField: '_id', //Id de la coleccion destino
                as: 'tipoIdentificacion' //alias como se llamara la nueva coleccion 
            }
        },
        {
            $unwind: '$tipoIdentificacion' //Separa los resultados
        },
        {
            $lookup: {
                from: 'perfils', //Nombre de la coleccion a crusar
                localField: 'idPerfil', //Id de la coleccion origen
                foreignField: '_id', //Id de la coleccion destino
                as: 'perfil' //alias como se llamara la nueva coleccion 
            }
        },
        {
            $unwind: '$perfil' //Separa los resultados
        },
        {
            $project: {
                _id: '$_id', perfil: '$perfil.descripcion', tipoIdentificacion: '$tipoIdentificacion.descripcion'
            }
        }
    ]
).pretty()

//Consulta que lista los usuarios Id
db.users.aggregate(
    [
         //Primero se filtra la llave de busqueda
         {
            $match: {
                _id: ObjectId('5ec6e238d01fcd5d5000aedd')
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
                direccion: '$direccion', tipoIdentificacion: '$tipoIdentificacion.descripcion', perfil: '$perfil.descripcion'
            }
        }
    ]
).pretty();

//Consulta que cruza el idProducto del Array detalle con la coleccion productos y muestra todos los campos
//de la la collecion facturacion
db.facturas.aggregate([
    {
        '$addFields': {
            'detalle': {'$ifNull': ['$detalle', [ ]] }
        }
    },
    {
        '$lookup': {
            from: 'productos',
            localField: 'detalle.idProducto',
            foreignField: '_id',
            as: 'detalle.idProducto'
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'idUser',
            foreignField: '_id',
            as: 'cliente'
        } 
    },
    {
        $lookup: {
            from: 'users',
            localField: 'idUserFacturador',
            foreignField: '_id',
            as: 'usuario'
        } 
    },
    {
        $lookup: {
            from: 'forma-pagos',
            localField: 'idFormaPago',
            foreignField: '_id',
            as: 'formaPago'
        } 
    },
    {'$unwind': '$detalle.idProducto'},
    { 
        '$group': { 
            '_id': '$_id',
            'numero': {'$first': '$numero'},
            'fecha_factura': {'$first': '$fecha_factura'},
            'fecha': {'$first': '$fecha'},
            'estado': {'$first': '$estado'},
            'detalle': {'$push': '$detalle'},
        }
    }
]).pretty();

//Facturacion ID
db.facturas.aggregate([
    //Primero se filtra la llave de busqueda
    {
        $match: {
            _id: ObjectId('5ecd96260f71bd47c40df1a6')
        }
    },
    { 
        '$project' : {
            'numero': 1,
            'fecha_factura': 1,
            'fecha': 1,
            'estado': 1,
            'idUser': 1,
            'idUserFacturador': 1,
            'idFormaPago': 1,
            'detalle': {'$ifNull': ['$detalle', [ ]] }
        }
    },
    {
        '$unwind': {
            'path': '$detalle',
            'preserveNullAndEmptyArrays': false
        }
    },
    {
        '$lookup': {
            from: 'productos',
            localField: 'detalle.idProducto',
            foreignField: '_id',
            as: 'detalle.idProducto'
        }
    },
    {'$unwind': '$detalle.idProducto'},
    {
        $lookup: {
            from: 'users',
            localField: 'idUser',
            foreignField: '_id',
            as: 'cliente'
        } 
    },
    {'$unwind': '$cliente'},
    {
        $lookup: {
            from: 'users',
            localField: 'idUserFacturador',
            foreignField: '_id',
            as: 'usuario'
        } 
    },
    {'$unwind': '$usuario'},
    {
        $lookup: {
            from: 'forma-pagos',
            localField: 'idFormaPago',
            foreignField: '_id',
            as: 'formaPago'
        } 
    },
    {'$unwind': '$formaPago'},
    { 
        '$group': { 
            '_id': '$_id',
            'numero': {'$first': '$numero'},
            'fecha_factura': {'$first': '$fecha_factura'},
            'fecha': {'$first': '$fecha'},
            'estado': {'$first': '$estado'},
            'cliente': {'$first': '$cliente'},
            'usuario': {'$first': '$usuario'},
            'formaPago': {'$first': '$formaPago'},
            'detalle': {'$push': {  nombre: '$detalle.idProducto.nombre',
                                    descripcion: 'detalle.idProducto.descripcion',
                                    descripcion: 'detalle.idProducto.unidad',
                                    cantidad: '$detalle.cantidad',
                                    precio: '$detalle.idProducto.precio',
                                    iva: { $divide: [ {$multiply: ['$detalle.idProducto.precio', '$detalle.idProducto.iva']}, 100]},
                                    descuento: { $divide: [ {$multiply: ['$detalle.idProducto.precio', '$detalle.idProducto.descuento']}, 100]},
                                    subtotal: {$multiply: ['$detalle.idProducto.precio', '$detalle.cantidad']} 
                                }
                        }          
        }
    },
   { $project: {
        _id: '$_id', numero: '$numero', fecha_factura: '$fecha_factura', estado : '$estado', usuario: '$usuario',
        cliente: '$cliente', formaPago: '$formaPago.descripcion', descuento: '$descuento', 
        'detalle': '$detalle' //,  'subtotal':{ $multiply: [ '$detalle.idProducto.precio', '$detalle.idProducto.precio' ]}
        
    }}
]).pretty();

/*
{"_id":{"$oid":"5ec6e238d01fcd5d5000aedd"},"fecha":{"$date":"2020-05-21T20:04:30.774Z"},"estado":"activo","nombre":"ANA ROCIO ROCHA BUSTOS","identificacion":"20830498","email":"rochabustosrocio@gmail.com","password":"$2a$10$eYqEx9o7G0Ycm8gwo.2TduDwBDMR0xibQA/bK0aDIerQ3j0Tr/I.m","numero":"3174220092","direccion":"Carrera 3 Bist A Este # 34 - 13, Barrio Bello Horizonte, Localidad 20 de julio","idTipoIdentificacion":{"$oid":"5ecbef081da846165cf37f80"},"idPerfil":{"$oid":"5ec6d741f8978e5e043793e4"},"__v":0}
{"_id":{"$oid":"5ec6e17bd01fcd5d5000aedc"},"fecha":{"$date":"2020-05-21T20:04:30.774Z"},"estado":"activo","nombre":"MONICA PATRICIA VALENCIA","identificacion":"59687495","email":"monika.valencia28@outlook.com","password":"$2a$10$eD2eW/marAQ8nBTAD8ECYeel79SMoDSoj0H6HA6Q1r4swd6cFH5Pm","numero":"3106194454","direccion":"Carrera 174A # 142 - 30, apartamento 204 torre 3, Barrio Bilbao, Localida Suba","idTipoIdentificacion":{"$oid":"5ecbef081da846165cf37f80"},"idPerfil":{"$oid":"5ec6d741f8978e5e043793e4"},"__v":0}
{"_id":{"$oid":"5ec6e238d01fcd5d5000aedd"},"fecha":{"$date":"2020-05-21T20:04:30.774Z"},"estado":"activo","nombre":"ANA ROCIO ROCHA BUSTOS","identificacion":"20830498","email":"rochabustosrocio@gmail.com","password":"$2a$10$eYqEx9o7G0Ycm8gwo.2TduDwBDMR0xibQA/bK0aDIerQ3j0Tr/I.m","numero":"3174220092","direccion":"Carrera 3 Bist A Este # 34 - 13, Barrio Bello Horizonte, Localidad 20 de julio","idTipoIdentificacion":{"$oid":"5ecbef081da846165cf37f80"},"idPerfil":{"$oid":"5ec6d741f8978e5e043793e4"},"__v":0}
*/

    //Listar productos
    db.productos.aggregate(
        [
            // //Primero se filtra la llave de busqueda
            // {
            //     $match: {
            //         idTipoIdentificacion: ObjectId('5ec7e435a403900584a33785')
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
                    _idPrecioProducto: '$precioProducto._id', fecha: '$precioProducto.fecha', estado: '$precioProducto.estado'
                }
            },       
            { $match : { estado : 'activo' } },
            { $sort : { fecha : -1} },
        ]
    ).pretty();