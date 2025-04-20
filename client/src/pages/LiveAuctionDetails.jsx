import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/LiveAuctionDetails.css";

const socket = io("http://localhost:9000");

// Helper function to validate and format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Invalid Time";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn("Invalid timestamp received:", timestamp);
    return "Invalid Time";
  }

  return date.toLocaleTimeString();
};

const LiveAuctionDetails = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Countdown timer logic
  useEffect(() => {
    const updateTimer = () => {
      if (!auction?.endTime) return;
      const endTime = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft("Auction Ended");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [auction]);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/auction/${auctionId}`);
        setAuction(response.data);
      } catch (err) {
        setError("Failed to load auction details");
      } finally {
        setLoading(false);
      }
    };

    const fetchBidHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/bids/bidsByAuction/${auctionId}`);
        console.log("Fetched bids:", response.data.bids); // Log the fetched bids
        setBids(response.data.bids);
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchAuctionDetails();
    fetchBidHistory();

    socket.emit("joinAuction", auctionId);
    console.log("Joined auction room:", auctionId);

    socket.on("newBid", (newBid) => {
      console.log("New bid received:", newBid); // Log the new bid
      setBids((prevBids) => [newBid, ...prevBids]);
      setAuction((prevAuction) => ({
        ...prevAuction,
        currentPrice: newBid.amount,
      }));
    });

    return () => {
      socket.emit("leaveAuction", auctionId);
      console.log("Left auction room:", auctionId);
      socket.off("newBid");
    };
  }, [auctionId]);

  if (loading) return <p className="loading">⏳ Loading auction details...</p>;
  if (error) return <p className="error">❌ {error}</p>;
  if (!auction) return <p className="error">❌ Auction not found</p>;

  return (
    <div className="live-auction-container">
      <div className="auction-header">
        <h1>{auction.title}</h1>
        <p className="desc">{auction.desc}</p>
      </div>

      <div className="auction-main">
        {/* Auction Details Section */}
        <div className="auction-details-card">
          <div className="current-price">
            <h2>Current Price</h2>
            <span className="price">${auction.currentPrice}</span>
          </div>
          <div className="detail-row">
            <strong>Seller:</strong> <span>{auction.seller?.name || "Unknown"}</span>
          </div>
          <div className="detail-row">
            <strong>Ends In:</strong> <span className="timer">{timeLeft}</span>
          </div>
        </div>

        {/* Live Bidding Activity Section */}
        <div className="bids-container">
          <h3>
            <span className="live-indicator"></span> Live Bidding Activity
          </h3>
          {bids.length === 0 ? (
            <p className="no-bids">No bids placed yet. Be the first!</p>
          ) : (
            <ul className="bids-list">
              {bids.map((bid, index) => (
                <li key={index} className={`bid-item ${index === 0 ? "new-bid" : ""}`}>
                  <span className="bidder-name">🔹 {bid.bidder?.name || "Unknown"}</span>
                  <span className="bid-amount">💰 ${bid.amount}</span>
                  <span className="bid-time">⏳ {formatTimestamp(bid.timeStamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionDetails;