const pdf = require('html-pdf');
  
  exports.crearPdf = function (content, ruta, options) {
      pdf.create(content, options).toFile(ruta, function(err, res) {
        if (err){
            console.log(err);
        } else {
            console.log(res);
        }
      });
  }