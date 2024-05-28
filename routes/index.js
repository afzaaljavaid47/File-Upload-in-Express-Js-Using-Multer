var express = require('express');
var router = express.Router();
var jwt=require('jsonwebtoken');
var userModel=require('../models/userModel');
var fileModel=require('../models/fileModel');
const multer  = require('multer')
var path = require('path');
const { randomUUID } = require('crypto');

async function auth(req,res,next){
  var token=req.cookies.jwt;
  if(token){
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
router.get('/',auth, function(req, res, next) {
  if(req.validate){
    res.render('index',{success:'',error:''});
  }
  else{
    res.redirect('/login');
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+"_"+randomUUID() + path.extname(file.originalname))
  }
})

const fileUpload = multer({ storage: storage })

router.post('/',auth,fileUpload.single('fileName'), async function(req, res, next) {
  if(req.validate){
    try {
      var fileTitle=await fileModel.find({fileTitle:req.body.fileTitle})
      console.log(fileTitle)
      if(!fileTitle.length>0){
        var fileModelData=new fileModel(req.body)
        fileModelData.fileName=req.file.filename;
        fileModelData.fileExtension=path.extname(req.file.filename);
        var fileSaveToDB=await fileModelData.save();
        console.log(fileSaveToDB);
        if(fileSaveToDB){
          res.render('index',{success:'File uploaded successfully.',error:''});
        }    
      }
      else
      {
        res.render('index',{success:'',error:'File title exists. Please use other title'});
      }
    } catch (error) {
      res.render('index',{success:'',error:error});
    }
  }
  else{
    res.redirect('/login');
  }
});
router.get('/about', function(req, res, next) {
  res.render('about');
});

module.exports = router;
