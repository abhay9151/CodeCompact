const mongoose=require('mongoose');

async function main(){
    await mongoose.connect(process.env.DB_CONNECT_STRING, {
        dbName: process.env.DB_NAME || undefined
    });
}

module.exports=main;