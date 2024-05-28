var express = require('express');
var router = express.Router();
var userModel=require('../models/userModel');
/* GET users listing. */
var jwt=require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var fileModel=require('../models/fileModel')
var path = require('path');
async function auth(req,res,next){
    var token=req.cookies.jwt;
    if(token){
      console.log(token)
      var userID=await jwt.verify(token,process.env.JWT_SECRET);
      var validateUser=await userModel.findById({_id:userID._id});
      if(validateUser){
          req.validate=true;
      }
      else{
        req.validate=false;
      }
    }
    else
    {
      req.validate=false;
    }
    next();
  }

router.get('/:fileName',auth, async function(req, res, next) {
    if(req.validate){
        console.log(path.join(__dirname, 'public/uploads/'+req.params.fileName))
        // res.download('/uploads/'+req.params.fileName);
        var filesData=await fileModel.find();
        console.log(filesData)
        res.render('files',{files:filesData});
      }
      else{
        res.render('login');
      }
});

module.exports = router;