//Importamos libreria pdf
const pdf = require('html-pdf');

export const options = {
    
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