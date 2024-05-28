var express = require('express');
var router = express.Router();
var userModel=require('../models/userModel');
/* GET users listing. */
var jwt=require('jsonwebtoken');
var bcrypt = require('bcryptjs');

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

router.get('/',auth, function(req, res, next) {
    if(req.validate){
        res.redirect('/');
      }
      else{
        res.render('login');
      }
});

router.post('/', async function(req, res, next) {
    var findUserFromDB=await userModel.findOne({userName:req.body.userName})
    console.log(findUserFromDB)
    if(findUserFromDB){
        var decryptPassword=await bcrypt.compare(req.body.password,findUserFromDB.password);
        console.log(decryptPassword)
        if(decryptPassword){
            jwt.sign({_id:findUserFromDB._id},process.env.JWT_SECRET,{expiresIn:'1d'},(err,token)=>{
                if(err) throw err;
                console.log(token)
                res.cookie('jwt',token,{expires:new Date(Date.now()+ 8 * 3600000),httpOnly:true})
                res.redirect('/');
            })
        }
        else
        {
            res.render('login',{error:'Incorrect password. Please enter correct password.'}); 
        }
    }
    else{
        res.render('login',{error:'Incorrect username. Please enter correct username.'}); 
    }
});

module.exports = router;
