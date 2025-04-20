const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploads = require("../utils/upload");

// Accept images (multiple) and certificate (single)
const multipleUpload = uploads.fields([
  { name: "productImages", maxCount: 5 },
  { name: "certificate", maxCount: 1 },
]);

router.post("/", authMiddleware, multipleUpload, auctionController.createAuction);
router.get("/", auctionController.getAllAuctions);
router.get("/seller", authMiddleware, auctionController.getSellerAuctions);
router.get("/seller/status", authMiddleware, auctionController.getSellerAuctionsByStatus); // New endpoint
router.get("/:id", auctionController.getAuctionById);
router.put("/:id", authMiddleware, multipleUpload, auctionController.updateAuction);
router.delete("/:id", authMiddleware, auctionController.deleteAuction);

module.exports = router;