var express = require('express');
var router = express.Router();
var userModel=require('../models/userModel');
/* GET users listing. */
var jwt=require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
var fileModel=require('../models/fileModel')
var path = require('path');
var download = require('file-download')
const multer  = require('multer')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

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


  const AdmZip = require('adm-zip');
  var uploadDir = fs.readdirSync(path.join(__dirname,"../public/uploads")); 
  
  router.get('/downloadAll', (req, res) => {
      const zip = new AdmZip();
      for(var i = 0; i < uploadDir.length;i++){
          zip.addLocalFile(path.join(__dirname,"../public/uploads/")+uploadDir[i]);
      }
      const downloadName = `${Date.now()}.zip`;
      const data = zip.toBuffer();
      zip.writeZip(path.join(__dirname,"../public/uploads/")+downloadName);
      res.set('Content-Type','application/octet-stream');
      res.set('Content-Disposition',`attachment; filename=${downloadName}`);
      res.set('Content-Length',data.length);
      res.send(data)
      res.redirect('/files')
  })

router.get('/',auth, async function(req, res, next) {
    if(req.validate){
        var filesData=await fileModel.find();
        res.render('files',{files:filesData});
      }
      else{
        res.render('login');
      }
});
router.get('/download/:fileName',auth, async function(req, res, next) {
    if(req.validate){
      var fileName=req.params.fileName;
      var filePath=path.join(__dirname, '../public/uploads/',fileName);
      res.download(filePath);
      }
      else{
        res.render('login');
      }
});

router.get('/delete/:id',auth, async function(req, res, next) {
  if(req.validate){
    await fileModel.deleteOne({_id:req.params.id})
    res.redirect('/files')
    }
    else{
      res.render('login');
    }
});

router.get('/edit/:id',auth, async function(req, res, next) {
  if(req.validate){
    var fileData=await fileModel.findOne({_id:req.params.id})
    console.log(fileData);
    res.render('edit',{fileData:fileData,success:'',error:''})
    }
    else{
      res.render('login');
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

router.post('/update',auth,fileUpload.single('fileNames'), async function(req, res, next) {
  if(req.validate){
    try {
      var fileDataById=await fileModel.find({_id:req.body.id})
      console.log(fileDataById)
      var fileTitle=await fileModel.find({fileTitle:req.body.fileTitle})
      if((req.body.fileTitle==fileDataById[0].fileTitle) || (!(req.body.fileTitle==fileDataById[0].fileTitle) && (fileTitle.length==0)) )
      {
        if(req.file){
          console.log(fileDataById[0].fileName)
          console.log(path.join(__dirname,'../public/uploads/'+fileDataById[0].fileName))
          fileNames=req.file.filename;
          fileExtension=path.extname(req.file.filename);
          await unlinkAsync(path.join(__dirname,'../public/uploads/'+fileDataById[0].fileName))
        }
        else
        {
          fileNames=fileDataById[0].fileName;
          console.log("File Name else",fileNames);
          fileExtension=fileDataById.fileExtension;
        }
        var updateDatatoDB = await fileModel.findOneAndUpdate({_id:req.body.id}, {fileTitle:req.body.fileTitle,fileName:fileNames,fileExtension:fileExtension});
        if(updateDatatoDB){
          res.redirect('/files');
        }    
      }
      else
      {
        var fileData=await fileModel.findOne({_id:req.body.id})
        res.render('edit',{fileData:fileData,success:'',error:'File title exists. Please use other title'});
      }
    } catch (error) {
      var fileData=await fileModel.findOne({_id:req.body.id})
      console.log(error)
      res.render('edit',{fileData:fileData,success:'',error:error});
    }
  }
  else{
    res.redirect('/login');
  }
});



module.exports = router;