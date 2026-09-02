const User=require('../model/user');
const validate=require('../uttils/validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');//token
const redisClient=require('../config/redis');
const register=async(req,res)=>{
    try{
        // validate the request body
        validate(req.body);
    
        const {firstName,lastName,emailId,age,password}=req.body;
        // now we will hash the password before saving it to the database
        req.body.password=await bcrypt.hash(password,10);
        req.body.role="user";

        // create user with the request body object
        const user = await User.create(req.body);
        // this tells that we are creating a token for the user and sending it to the frontend
        const token=jwt.sign({_id:user._id,email:user.emailId,role:'user'},process.env.JWT_SECRET,{expiresIn:60*60});
        // this tell kitni der baad token ko frontend se delete karna hai
        res.cookie('token',token,{maxAge:60*60*1000,httpOnly:true,secure:false,sameSite:'strict'});
        res.status(201).send("User Registered Successfully");
        }
        catch(err){
        return res.status(400).json({ success: false, error: err.message });
        }
}

const login=async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        // database me find karega emailid ko
        const user=await User.findOne({emailId});
        // agr user nhi mila to error throw karega
        if(!user){
            throw new Error("User not found");
        }
        // agr user mil gaya to password ko compare karega
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            throw new Error("Invalid password");
        }
        // agr password valid hai to token create karega and send karega to frontend
        const token=jwt.sign({_id:user._id,email:user.emailId,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000,httpOnly:true,secure:false,sameSite:'strict'});//secure true in https.
        res.status(200).send("User Logged In Successfully");
    }
    catch(err){
        return res.status(400).json({ success: false, error: err.message });    
    }
}

const logout = async (req, res) => {
    // validate the token
    // token add kardunga redis ke blocklist me.

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        // redis ke andar add karna he ab
        await redisClient.set(`token:${token}`, "blocked");
        await redisClient.expire(
            `token:${token}`,
            payload.exp - Math.floor(Date.now() / 1000)
        );
        // cookie ko delete karunga frontend se
        res.clearCookie('token');
        res.status(200).send("User Logged Out Successfully");
    }

    catch (err) {
        return res.status(503).json({success: false,error: err.message});
    }
};
const adminRegister=async(req,res)=>{
    try{
        // validate the request body
        validate(req.body);
    
        const {firstName,lastName,emailId,age,password}=req.body;
        // now we will hash the password before saving it to the database
        req.body.password=await bcrypt.hash(password,10);
        req.body.role="admin";

        // create user with the request body object
        const user = await User.create(req.body);
        // this tells that we are creating a token for the user and sending it to the frontend
        const token=jwt.sign({_id:user._id,email:user.emailId,role:'admin'},process.env.JWT_SECRET,{expiresIn:60*60});
        // this tell kitni der baad token ko frontend se delete karna hai
        res.cookie('token',token,{maxAge:60*60*1000,httpOnly:true,secure:false,sameSite:'strict'});
        res.status(201).send("Admin Registered Successfully");
    }
    catch(err){
        return res.status(400).json({ success: false, error: err.message });
    }
}

module.exports = { register,login,logout,adminRegister};