const mongoose=require('mongoose');

async function main(){
    await mongoose.connect(process.env.DATABASE_CONNECTION);
}

module.exports=main;