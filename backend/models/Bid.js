const mongoose=require("mongoose")

const BidSchema= new mongoose.Schema({
    auction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Auction",
        required:true
    },
    bidder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    bidTime:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model("Bid",BidSchema)