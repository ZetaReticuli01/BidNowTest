const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productImages: [{ type: String }], // Array of image paths
    certificate: { type: String }, // Path to certificate file
    certifyingAuthority: { type: String, default: "" },
    certificateNumber: { type: String, default: "" },
    isReplica: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Auction", auctionSchema);