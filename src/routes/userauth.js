const express=require('express');
const authrouter = express.Router();
const{register,login,logout}=require('../controllers/userauthentication');

authrouter.post('/register',register);
//login 
authrouter.post('/login',login);
//logout
authrouter.get('/logout',logout);
//getprofile
// authrouter.get('/getprofile',getprofile);

module.exports=authrouter;
