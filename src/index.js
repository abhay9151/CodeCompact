const express=require('express');
require('dotenv').config();
require('./config/db')
const cookieparser=require('cookies-parser');

const app=express();
app.use(express.json());
app.use(cookieparser());

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
