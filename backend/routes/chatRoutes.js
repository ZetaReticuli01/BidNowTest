const express=require("express")
const router=express.Router()
const chatController=require("../controllers/chatController")
router.use(express.json())


router.post("/send",chatController.sendMessage)
router.get("/:auctionId",chatController.getChatMessages)
module.exports=router