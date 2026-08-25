const validator=require('./uttils/validator');
const validate=(data)=>{

    const {firstName,lastName,emailId,age,password}=data;

    const isAllowed=mandatoryFields.every((k)=>data.Object.keys(data).includes(k));

    if(!isAllowed){
        throw new Error("Missing mandatory fields");
    }
    if(!validator.isEmail(emailId)){
        throw new Error("Invalid email format");
    }
    if(!validator.isLength(firstName,{min:3,max:12})){
        throw new Error("First name should be between 3 and 12 characters");
    }
    if(lastName && !validator.isLength(lastName,{min:3,max:12})){
        throw new Error("Last name should be between 3 and 12 characters");
    }
    if(age && !validator.isInt(age,{min:6,max:100})){
        throw new Error("Age should be between 6 and 100");
    }
    if(!validator.isLength(password,{min:8})){
        throw new Error("Password should be at least 8 characters long");
    }   
    if(!validator.isStrongPassword(password)){
        throw new Error("Password should contain at least one uppercase letter, one lowercase letter, one number and one special character");
    }
}
module.exports={validate}