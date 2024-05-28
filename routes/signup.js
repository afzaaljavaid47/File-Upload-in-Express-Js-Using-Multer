var express = require('express');
var router = express.Router();
var userModel=require('../models/userModel');
var jwt=require('jsonwebtoken');
var bcrypt = require('bcryptjs');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('signup',{success:'',error:''});
});
router.post('/', async function(req, res, next) {
    try {
        var userRegisterModel=new userModel(req.body);
        var encryptPassword=await bcrypt.hash(req.body.password,12);
        console.log(encryptPassword);
        userRegisterModel.password=encryptPassword;
        var userRegisterData=await userRegisterModel.save();
        res.render('signup',{success:'User register successfully',error:''});
    } catch (error) {
        res.render('signup',{success:'',error:'Some error occurs. Please try again'});
}
});
module.exports = router;
