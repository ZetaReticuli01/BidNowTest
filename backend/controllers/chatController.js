const Auction=require("../models/Auction")
const User=require("../models/User")
const Chat=require("../models/Chat")

exports.sendMessage=async(req,res)=>{
    try{
    const {auction,sender,message}=req.body
    const auctionId=await Auction.findById(auction)
    const userId=await User.findById(sender)
    if(!auctionId||!userId){
        return res.status(404).json({error:"Invalid auction"})
    }
        if(!message){
            return res.status(401).json("Message is empty")
        }
            const chat = new Chat({auction,sender,message})
            const savedChat= await chat.save()
            global.io.emit("receiveMessage",savedChat)
             res.status(201).json(savedChat)
        }
    catch(err){
        return res.status(500).json("Internal Server Error")
    }
}

exports.getChatMessages=async(req,res)=>{
    try{
    const auction=req.params.auctionId
    const messages=await Chat.find({auction}).populate("sender","name email")
    if(!messages.length){
        return res.status(404).json("Messages not found")
    }
    res.status(201).json({messages})
}
catch(err){
    return res.status(500).json("Internal Server Error!")
}
}

    

