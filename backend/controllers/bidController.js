const express = require("express");
// router.use(express.json()) // Not needed here, handled by app.js
const Bid = require("../models/Bid");
const User = require("../models/User");
const Auction = require("../models/Auction");

const placeBid = async (req, res) => {
  try {
    const { auction, amount } = req.body;
    const bidder = req.user.userId;
    if (!auction || !amount) {
      return res.status(401).json({ err: "Error" });
    }

    const now = Date.now();
    const auctionData = await Auction.findById(auction);
    if (!auctionData) {
      return res.status(404).json({ err: "Error in auctionID" });
    }
    if (now > auctionData.endTime) {
      return res.status(400).json({ error: "Auction has ended" });
    }

    const bidderData = await User.findById(bidder);
    if (!bidderData) {
      return res.status(404).json({ err: "Error in bidderID" });
    }
    if (auctionData.seller.toString() === bidder) {
      return res.status(403).json({ Error: "Sellers can't bid on their own auctions" });
    }
    if (amount <= auctionData.currentPrice) {
      return res.status(400).json({ error: "Bid amount must be higher than the current price" });
    }
    if (bidderData.wallet < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    bidderData.wallet -= amount;
    await bidderData.save();

    auctionData.currentPrice = amount;
    auctionData.highestBidder = bidder;

    const newBid = new Bid({
      auction,
      bidder,
      amount,
    });

    auctionData.bids.push(newBid._id);
    await newBid.save();
    await auctionData.save();

    // Emit real-time bid update
    global.io.to(auction.toString()).emit("newBid", {
      auctionId: auction,
      bidder: {
        id: bidderData._id,
        name: bidderData.name,
      },
      amount: newBid.amount,
      timeStamp: new Date(),
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

const getHighestBid = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const auction = await Auction.findById(auctionId).populate("highestBidder", "name email");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    console.log(auction.bids);

    res.status(200).json({
      auctionId: auction._id,
      title: auction.title,
      currentPrice: auction.currentPrice,
      highestBidder: auction.highestBidder || null,
    });
  } catch (err) {
    console.error("Error in getHighestBid:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBidsByAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ Error: "Auction not found" });
    }
    const bids = await Bid.find({ auction: auction._id }).populate("bidder", "name email");

    res.status(200).json({
      bids: bids.length > 0 ? bids : [],
      auctionId: auction._id,
      title: auction.title,
    });
  } catch (err) {
    return res.status(500).json("Internal server error");
  }
};

const getBidsByUser = async (req, res) => {
  try {
    const bidderId = req.user.userId; // Use authenticated user ID
    const bids = await Bid.find({ bidder: bidderId })
      .populate("auction", "title endTime currentPrice")
      .sort({ bidTime: -1 }); // Sort by most recent
    res.status(200).json({ bids });
  } catch (err) {
    console.error("Error in getBidsByUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  placeBid,
  getHighestBid,
  getBidsByAuction,
  getBidsByUser, // Added new method
};