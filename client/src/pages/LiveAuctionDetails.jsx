import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/LiveAuctionDetails.css";

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

// Custom axios instance with timeout
const axiosInstance = axios.create({
  timeout: 10000, // 10-second timeout
});

const LiveAuctionDetails = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const socketRef = useRef(null);

  // Countdown timer logic
  const updateTimer = useCallback(() => {
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
  }, [auction]);

  useEffect(() => {
    const newSocket = io("http://localhost:9000", { 
      reconnection: true, 
      reconnectionAttempts: Infinity, 
      reconnectionDelay: 1000 
    });
    socketRef.current = newSocket;

    const fetchAuctionDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Starting fetch for auction details, auctionId:", auctionId, "token:", token);
        const response = await axiosInstance.get(`http://localhost:9000/api/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Auction details response:", response.data);
        setAuction(response.data);
      } catch (err) {
        console.error("Error fetching auction details:", err.message, err.response?.data || err.response?.status);
        setError(`Failed to load auction details: ${err.message}`);
      }
    };

    const fetchBidHistory = async () => {
      try {
        console.log("Starting fetch for bid history, auctionId:", auctionId);
        const response = await axiosInstance.get(`http://localhost:9000/api/bids/bidsByAuction/${auctionId}`);
        console.log("Fetched bids:", response.data.bids);
        setBids(response.data.bids);
      } catch (err) {
        console.error("Error fetching bids:", err.message, err.response?.data || err.response?.status);
        setError((prev) => prev ? `${prev}\nFailed to load bid history: ${err.message}` : `Failed to load bid history: ${err.message}`);
      } finally {
        setLoading(false); // Ensure loading stops even on error
      }
    };

    fetchAuctionDetails();
    fetchBidHistory();

    newSocket.emit("joinAuction", auctionId);
    console.log("Joined auction room:", auctionId);

    const handleNewBid = (newBid) => {
      console.log("New bid received in room:", auctionId, newBid);
      // Ensure timestamp is included if not provided
      const bidWithTimestamp = { ...newBid, timeStamp: new Date() };
      setBids((prevBids) => {
        const existingBid = prevBids.find((bid) => bid.bidder.id === newBid.bidder.id);
        if (!existingBid) {
          return [bidWithTimestamp, ...prevBids]; // Add new bid with timestamp
        }
        return prevBids.map((bid) =>
          bid.bidder.id === newBid.bidder.id ? bidWithTimestamp : bid
        ); // Update existing bid with timestamp
      });
      setAuction((prevAuction) => ({
        ...prevAuction,
        currentPrice: newBid.amount,
      }));
    };

    newSocket.on("newBid", handleNewBid); // Changed to "newBid" to match server emission

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("joinAuction", auctionId); // Rejoin room on reconnect
    });
    newSocket.on("disconnect", () => console.log("Socket disconnected"));
    newSocket.on("connect_error", (err) => console.error("Socket connection error:", err));
    newSocket.on("reconnect", () => {
      console.log("Socket reconnected, rejoining room:", auctionId);
      newSocket.emit("joinAuction", auctionId);
    });

    // Fallback: Refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      console.log("Refreshing auction details and bids...");
      fetchAuctionDetails();
      fetchBidHistory();
    }, 10000);

    // Manual test: Trigger a bid update (for debugging)
    window.addEventListener("testBid", (e) => {
      const testBid = e.detail;
      handleNewBid(testBid);
      console.log("Test bid triggered:", testBid);
    });

    return () => {
      if (newSocket) {
        newSocket.emit("leaveAuction", auctionId);
        console.log("Left auction room:", auctionId);
        newSocket.off("newBid", handleNewBid);
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("reconnect");
        newSocket.close();
      }
      clearInterval(refreshInterval);
      window.removeEventListener("testBid", handleNewBid);
    };
  }, [auctionId]);

  useEffect(() => {
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [updateTimer]);

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
          {/* <button
            onClick={() => {
              const testBid = { bidder: { id: "test", name: "Test Bidder" }, amount: 100.5, timeStamp: new Date() };
              window.dispatchEvent(new CustomEvent("testBid", { detail: testBid }));
            }}
            style={{ marginTop: "10px" }}
          >
            Test Bid (Debug)
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionDetails;