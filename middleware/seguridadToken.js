const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
    //Leer el token del header
    const token = req.header('x-auth-token');

    //Revisar si no hay token
    if(!token){
        return res.status(401).json({msg: 'No hay token, permiso no valido'});
    }
    
    try {
        const cifrado = jwt.verify(token, process.env.SECRETA);
        req.user = cifrado.user;
        next();
    } catch (error) {
        res.status(401).json({msg: 'token no valido'});
    }

    //validar el token
}