var express = require('express');
var router = express.Router();
var path=require('path')
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: 'EDIService@alphaguardian.com',
      pass: 'D01BuB!s6H4@SsJJis3H8F!n'
    }
  });
  
router.get('/',async function(req, res, next) {
    const info = await transporter.sendMail({
        from: 'ediservice@cannonsecurityproducts.com',
        to: "afzaaljavaid47@gmail.com",
        subject: "Hello ✔", 
        text: "Hello world?",
        html: "<b>Hello world?</b>",
        attachments:[
            {
                filename:'images.zip',
                path:path.join(__dirname,'../public/uploads/1690484999654.zip')
            }
        ]
      });
      console.log(info);
      res.json(info.messageId);
});

module.exports = router;
