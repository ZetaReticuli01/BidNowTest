const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const bidController = require("../controllers/bidController");

router.post("/place", authMiddleware, bidController.placeBid);
router.get("/highestBid/:auctionId", bidController.getHighestBid);
router.get("/bidsByAuction/:id", bidController.getBidsByAuction);
router.get("/bidsByUser/:userId", authMiddleware, bidController.getBidsByUser);

module.exports = router;