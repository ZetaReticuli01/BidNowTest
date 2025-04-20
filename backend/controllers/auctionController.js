const Auction = require("../models/Auction");
const schedule = require("node-schedule"); // Ensure this is installed with `npm install node-schedule`

exports.createAuction = async (req, res) => {
  try {
    const {
      title,
      desc,
      startingPrice,
      currentPrice,
      startTime,
      endTime,
      certifyingAuthority,
      certificateNumber,
      isReplica,
      isVerified,
    } = req.body;
    const seller = req.user.userId;

    if (!title || !desc || !startingPrice || !startTime || !endTime || !seller) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const now = new Date();
    if (new Date(startTime) < now) {
      return res.status(400).json({ error: "Start time cannot be in the past" });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const imagePaths = req.files?.productImages?.map((file) => file.filename) || [];
    if (imagePaths.length === 0) {
      return res.status(400).json({ error: "Product images are required" });
    }

    let certificatePath = null;
    if (!isReplica && (!req.files?.certificate || !req.files.certificate.length)) {
      return res.status(400).json({ error: "Certificate is required for non-replica auctions" });
    }
    if (req.files?.certificate?.length) {
      certificatePath = req.files.certificate[0].filename;
    }

    const startingPriceNum = Number(startingPrice);
    const currentPriceNum = Number(currentPrice) || startingPriceNum;
    if (currentPrice && currentPriceNum !== startingPriceNum) {
      return res.status(400).json({ error: "Current price must equal starting price initially" });
    }

    const isVerifiedValue = isVerified === "true" || (certificatePath !== null && !isReplica);

    const newAuction = new Auction({
      title,
      desc,
      startingPrice: startingPriceNum,
      currentPrice: currentPriceNum,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      seller,
      productImages: imagePaths,
      certificate: certificatePath || undefined,
      certifyingAuthority: certifyingAuthority || "",
      certificateNumber: certificateNumber || "",
      isReplica: isReplica === "true" || false,
      isVerified: isVerifiedValue,
      status: new Date(startTime) > now ? "scheduled" : "active", // Set initial status
    });

    const saved = await newAuction.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating auction:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getSellerAuctionsByStatus = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const status = req.query.status; // e.g., "active", "scheduled", "completed"
    const now = new Date();

    let auctions;
    if (status === "active") {
      auctions = await Auction.find({
        seller: sellerId,
        startTime: { $lte: now },
        endTime: { $gt: now },
      });
    } else if (status === "scheduled") {
      auctions = await Auction.find({
        seller: sellerId,
        startTime: { $gt: now },
      });
    } else if (status === "completed") {
      auctions = await Auction.find({
        seller: sellerId,
        endTime: { $lte: now },
      }).populate("highestBidder", "name email");
    } else {
      return res.status(400).json({ error: "Invalid status parameter" });
    }

    res.status(200).json(auctions);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Keep existing methods unchanged
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.status(200).json(auctions);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getSellerAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user.userId });
    res.status(200).json(auctions);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.status(200).json(auction);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.updateAuction = async (req, res) => {
  try {
    const updates = req.body;
    const auction = await Auction.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!auction) {
      return res.status(404).json({ error: "Auction not found or unauthorized" });
    }
    res.status(200).json(auction);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });
    if (!auction) {
      return res.status(404).json({ error: "Auction not found or unauthorized" });
    }
    res.status(200).json({ message: "Auction deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Schedule the check for completed auctions (run every minute)
schedule.scheduleJob("*/1 * * * *", async () => {
  console.log("Checking for completed auctions...");
  const now = new Date();
  const auctions = await Auction.find({
    status: { $ne: "completed" }, // Avoid reprocessing completed auctions
    endTime: { $lte: now },
  });

  for (const auction of auctions) {
    auction.status = "completed";
    if (auction.highestBidder) {
      auction.winner = auction.highestBidder; // Set winner if bidder exists
    }
    await auction.save();
    console.log(`Updated auction ${auction._id} to completed`);
  }
});