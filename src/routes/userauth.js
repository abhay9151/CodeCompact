const express=require('express');
const authrouter = express.Router();
const{register,login,logout,adminRegister}=require('../controllers/userauthentication');
const usermiddleware=require('../middleware/usermiddleware');
const adminmiddleware=require('../middleware/adminmiddleware');


authrouter.post('/register',register);
//login 
authrouter.post('/login',login);
//logout
authrouter.post('/logout', usermiddleware, logout);
//getprofile
// authrouter.get('/getprofile',getprofile);
authrouter.post('/admin',adminmiddleware,adminRegister);

module.exports=authrouter;
