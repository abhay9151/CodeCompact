const express=require('express');
require('dotenv').config();
const main=require('./config/db')
const cookieparser=require('cookie-parser');
const authrouter=require('./routes/userauth');

const app=express();
app.use(express.json());
app.use(cookieparser());
app.use('/user',authrouter);
app.get('/', (req, res) => {
    res.send("Hello World");
});

main()
.then(async()=>{
    console.log("Database connected successfully");
    app.listen(process.env.PORT,()=>{
    console.log("Server is listening at port no:"+process.env.PORT);
})
})
.catch((err)=>{
    console.log(err);
})
