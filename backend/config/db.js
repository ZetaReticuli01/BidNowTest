const mongoose=require('mongoose')
require("dotenv").config()

const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI,{
        })
        console.log(`Mongodb connected: ${conn.connection.host}`)
    }
    catch(err){
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}
module.exports=connectDB