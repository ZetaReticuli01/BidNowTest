const { timeStamp } = require("console")
const mongoose=require("mongoose")

const chatSchema=new mongoose.Schema({
    auction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Auction",
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model("Chat",chatSchema)