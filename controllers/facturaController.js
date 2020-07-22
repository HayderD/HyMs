const {validationResult} = require('express-validator');
const Producto = require('../models/Producto');
const ObjectID = require('mongodb').ObjectID
const Factura = require('../models/Factura');
const Parametros = require('../models/Parametros');
const User = require('../models/User');
const {facturacionDiario, reporteVenta} = require('../pdf/FacturacionDiaria');
const {crearPdf} = require('../funciones/pdf');
const fileDownload = require('js-file-download');
const {sendEmail} = require('../funciones/email');
const fs = require("fs");

const optionsFacturacionDiario = {
    
    format: 'Letter' ,
  
    border: {            // default is 0, units: mm, cm, in, px
      right: '0.5in',
      left: '0.5in'
    },
          // Override the initial pagination number
    header: {
      height: "50mm",
    },
  };

  const optionsReporteVentas = {
    
    format: 'Letter' ,
  
    border: {            // default is 0, units: mm, cm, in, px
      right: '0.5in',
      left: '0.5in'
    },
          // Override the initial pagination number
    header: {
      height: "20mm"
    },
  };

exports.getId = async (req, res) => {
    try {
        let object = await Factura.aggregate([
            //Primero se filtra la llave de busqueda
            {
                $match: {
                    _id: ObjectID(req.params.id)
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
                    'fecha': {'$first': '$fecha'},
                    'estado': {'$first': '$estado'},
                    'cliente': {'$first': '$cliente'},
                    'usuario': {'$first': '$usuario'},
                    'formaPago': {'$first': '$formaPago'},
                    'detalle': {'$push': {  nombre: '$detalle.idProducto.nombre',
                                            descripcion: '$detalle.idProducto.descripcion',
                                            unidad: '$detalle.idProducto.unidad',
                                            cantidad: '$detalle.cantidad',
                                            valor_unitario: '$detalle.valor_unitario',
                                            iva: '$detalle.iva',
                                            descuento: '$detalle.descuento',
                                            valor_total: '$detalle.valor_total' 
                                        }
                                }          
                }
            },
           { $project: {
                _id: '$_id', numero: '$numero', fecha: '$fecha', estado : '$estado', usuario: '$usuario',
                cliente: '$cliente', formaPago: '$formaPago.descripcion', 'detalle': '$detalle'                
            }}
        ],
        function(error, data){
            if(error){
                throw error;
            }
        });    
        
       const {enviar} = req.body;

        object = object[0];

        const numero_factura = await Parametros.find({idUser: object.usuario._id, nombre: 'numero_factura'});
        const fecha_inicial_facturacion = await Parametros.find({idUser: object.usuario._id, nombre: 'fecha_inicial_facturacion'});
        const fecha_final_facturacion = await Parametros.find({idUser: object.usuario._id, nombre: 'fecha_final_facturacion'});
        const rango_inicial_factura = await Parametros.find({idUser: object.usuario._id, nombre: 'rango_inicial_factura'});
        const rango_final_factura = await Parametros.find({idUser: object.usuario._id, nombre: 'rango_final_factura'});
        const consecutivo_facturacion = await Parametros.find({idUser: object.usuario._id, nombre: 'consecutivo_facturacion'});
        const foorter_factura = await Parametros.find({idUser: object.usuario._id, nombre: 'foorter_factura'});

        // const esCurrencyFormat = new Intl.NumberFormat();
        // const usCurrency = esCurrencyFormat.format(100);
        // console.log(usCurrency)
        //Calculamos totales
        const ivaTotal =  object.detalle.map(({ iva }) => iva).reduce((sum, i) => sum + i, 0);
        const descuentoTotal =  object.detalle.map(({ descuento }) => descuento).reduce((sum, i) => sum + i, 0);
        const total =  object.detalle.map(({ valor_total }) => valor_total).reduce((sum, i) => sum + i, 0);
       
        object.numero_factura = numero_factura[0];
        object.fecha_inicial_facturacion = fecha_inicial_facturacion[0];
        object.fecha_final_facturacion = fecha_final_facturacion[0];
        object.rango_inicial_factura = rango_inicial_factura[0];
        object.rango_final_factura = rango_final_factura[0];
        object.consecutivo_facturacion = consecutivo_facturacion[0];
        object.foorter_factura = foorter_factura[0];

        object.ivaTotal = ivaTotal;
        object.descuentoTotal = descuentoTotal;
        object.total = total;

        const factura = facturacionDiario(object);        
        
        const respuesta = crearPdf(factura, `public/pdf/${object.usuario._id}/${object._id}.pdf`, optionsFacturacionDiario);

        res.status(200).json({respuesta});        
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }                                      
}

exports.enviarFacturaDiaria = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

   
    try {
        const {idUserFacturador, idUser, numero} = req.body;
       
        let user = await User.find({_id: idUser});
       
        user = user[0];

        if(user){
            const path = `./public/pdf/${idUserFacturador}/${req.params.id}.pdf`;
            fs.statSync(path);
                console.log('file or directory exists');
                
                const adjunto = {
                    filename: `${req.params.id}.pdf`,
                    path,
                    contentType: 'application/pdf'
                }

                const envio =   sendEmail(user.email, 
                                        'Documento de venta', 
                                        'Sistema de Facturación', 
                                        'FacturacionDiaria',
                                        {name: user.nombre, numero},
                                        adjunto);

            res.status(200).json({msg: 'Correo enviado exitosamente'});                             
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('file or directory does not exist');
          }
    }
}

exports.list = async (req, res) => {
    try {
        let object = await Factura.aggregate([

            // First Stage 2020-07-19T00:00:00.000Z al '2020-07-20T23:00:00.000Z'
            {
                $match : {
                    'fecha': { $gte: new Date(`${req.params.fechaInicial}T00:00:00.000Z`), 
                                $lt: new Date(`${req.params.fechaFinal}T23:00:00.000Z`)
                            },
                    idUserFacturador:  ObjectID(req.params.idUser)                                        
                }
            },
            //Primero se filtra la llave de busqueda
            { 
                '$project' : {
                    'fecha': 1,
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
                    from: 'forma-pagos',
                    localField: 'idFormaPago',
                    foreignField: '_id',
                    as: 'formaPago'
                } 
            },
            {'$unwind': '$formaPago'},
            { 
                '$group': { 
                    '_id': '$fecha',
                    'fecha': {'$first': '$fecha'},
                    'formaPago': {'$first': '$formaPago'},
                    'detalle': {'$push': { 
                                            nombre: '$detalle.idProducto.nombre',
                                            cantidad: {$sum: '$detalle.cantidad'},
                                            iva: {$sum: '$detalle.iva'},
                                            descuento: {$sum: '$detalle.descuento'},
                                            valor_total: {$sum: '$detalle.valor_total'}                        
                                        }
                                }          
                }
            },
           { $project: {
               _id: '$_id', formaPago: '$formaPago.descripcion', 'fecha': '$fecha', 'detalle': '$detalle'                
            }},
            {'$unwind': '$detalle'},
            {
                $group : {
                    _id : '$detalle.nombre',
                    formaPago: {'$first': '$formaPago'},                     
                    cantidad: { $sum: '$detalle.cantidad' },
                    iva: { $sum: '$detalle.iva' },
                    descuento: { $sum: '$detalle.descuento' },
                    valor_total: { $sum: '$detalle.valor_total' }
                 }
                }
        ],
        function(error, data){ 
            if(error){
                throw error;
            }
        }); 

        const ivaTotal =  object.map(({ iva }) => iva).reduce((sum, i) => sum + i, 0);
        const descuentoTotal =  object.map(({ descuento }) => descuento).reduce((sum, i) => sum + i, 0);
        const total =  object.map(({ valor_total }) => valor_total).reduce((sum, i) => sum + i, 0);

        let respuesta = {
            object,
            ivaTotal,
            descuentoTotal,
            total,
            fechaInicial: req.params.fechaInicial,
            fechaFinal: req.params.fechaFinal
        }

        const reporte = reporteVenta(respuesta); 

        respuesta = crearPdf(reporte, `public/pdf/${req.params.idUser}/reporteVentas.pdf`, optionsReporteVentas);

        res.status(200).json({msg: 'Se genero reporte de ventas exitosamente'});
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
    
    try {
        //Creamos usiario con la estructura del json recibido
        let object = new Factura(req.body);

        let objectParametro = await Parametros.find({_id: req.body.idParametro});

        objectParametro = objectParametro[0];

        if(objectParametro){

            object.numero = zeroFill(Number(objectParametro.valor) + 1, 4);  
    
            const parametro = {
                valor: zeroFill(Number(objectParametro.valor) + 1, 4)
           };

            await Parametros.findOneAndUpdate({_id: objectParametro._id}, parametro, {new: true});

            //Guardamos el usuario en BD
            object = await object.save();

            res.status(200).json({object}); 
        }else{
            return res.status(400).json({msg: 'No se pudo crear la factura'});
        }              
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }    
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // siempre devuelve tipo cadena
}

exports.edit = async (req, res) => {
    //Revisamos si hay errores
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    //Estraemos los datos
    const {cantidad, idFormaPago, idProducto, idUser} = req.body;

    try {
       let object = {
        cantidad, 
        idFormaPago,
        idProducto,
        idUser
       };
  
       object = await Factura.findOneAndUpdate({_id: req.params.id}, object, {new: true});
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
        return res.status(400).json({errors: errors.array()})
    }

    try { 

        let object = {
            estado: "Inactivo"
        }
        //Eliminar
        object = await Factura.findOneAndUpdate({_id: req.params.id}, object, {new: true});
        res.status(200).send({msg: 'La factura se elimino correctamente'});
     } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
     }
}