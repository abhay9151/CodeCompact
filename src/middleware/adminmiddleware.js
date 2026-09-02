const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const User = require('../model/user');
const adminmiddleware=async(req,res,next)=>{
    try{
        const{token}=req.cookies;// sabse pahele hame token ko nikalna hota he.
        if(!token){
            throw new Error("Token not found");
        }
        const payload=jwt.verify(token,process.env.JWT_SECRET);
        const{_id}=payload;
        const result=await User.findById(_id);
        if(result.role!=='admin'){
            throw new Error("User is not admin");
        }
        if(!result){
            throw new Error("User not found");
        }
        //Kahi wo redis ke blocklist me to nhi he.
        const isBlocked=await redisClient.get(`token:${token}`);
        if(isBlocked){
            throw new Error("Token is blocked");
        }
        req.result=result;

        next();
    }
    catch(err){
        return res.status(401).json({ success: false, error: err.message });
    }
}   
module.exports=adminmiddleware;