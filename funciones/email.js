const nodemailer = require("nodemailer");
const hbs = require("nodemailer-handlebars");
require("dotenv").config({ path: "variables.env" });

// email sender function
exports.sendEmail = function (
  emailTo,
  subject,
  texto,
  nameTaplate,
  varTaplate,
  adjunto
) {
  // Definimos el transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CUENTA,
      pass: process.env.PASSWORD,
    },
  });

  // Step 2

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".handlebars",
        layoutsDir: "templates",
        defaultLayout: "",
        partialsDir: "templates",
      },
      viewPath: process.env.PATH_TEMPLATE,
    })
  );

  // Definimos el email
  var mailOptions = {
    from: process.env.EMAIL_FROM,
    to: emailTo,
    subject: subject,
    text: texto,
    template: nameTaplate,
    context: varTaplate
  };

 

  if(adjunto){
    const attachments = [{ 
        filename: adjunto.filename, 
        path: adjunto.path, 
        contentType: adjunto.contentType
      }];

      mailOptions.attachments = attachments;
  }

  console.log(mailOptions);

  // Enviamos el email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent");
    }
  });
};