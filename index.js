const cors = require('cors');
const path = require('path');

const express = require('express');
const conectDB = require('./config/bd');

//const publicPath = path.join(__dirname, 'public/img/');

//Crear servidor
const app = express();

//Configuramos folder public
app.use(express.static( __dirname + '/public'));

//Conectar al servidor DB
conectDB();

//Habilitar cors
app.use(cors());

//Habilitar express.json
app.use(express.json({extended: true})); 

//Puerto de la app
const port = process.env.port || 4000;

//Importamos rutas
app.use('/api/tipo-identificacion', require('./routes/tipoIdentificacion'));
app.use('/api/autentication', require('./routes/autentication'));
app.use('/api/parametros', require('./routes/parametros'));
app.use('/api/forma-pago', require('./routes/formaPago'));
app.use('/api/producto', require('./routes/producto'));
app.use('/api/factura', require('./routes/factura'));
app.use('/api/perfil', require('./routes/perfil'));
app.use('/api/user', require('./routes/user'));

//Definir la pagina principal
app.get('/', (req, res) => {
   console.log('Inicio programer')
});

//Arrancar la app
app.listen(port, '0.0.0.0', () => {    
    console.log(`El servidor esta funcionando en el puerto ${PORT}`);
});


