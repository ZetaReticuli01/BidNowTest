import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ActiveAuctions.css";

const ActiveAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/seller/status?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(response.data);
    } catch (err) {
      setError("Failed to load active auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAuctions();
    const interval = setInterval(fetchActiveAuctions, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Check end times and trigger refresh when an auction ends
  useEffect(() => {
    const checkEndTimes = () => {
      const now = new Date();
      const endedAuctions = auctions.filter((auction) => new Date(auction.endTime) <= now);
      if (endedAuctions.length > 0) {
        fetchActiveAuctions(); // Refresh to move to Completed Auctions
      }
    };
    const interval = setInterval(checkEndTimes, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [auctions]);

  if (loading) return <p className="active-loading">Loading active auctions...</p>;
  if (error) return <p className="active-error">{error}</p>;
  if (auctions.length === 0) return <p className="active-no-auctions">No active auctions.</p>;

  return (
    <div className="active-auctions-container">
      <h2 className="active-section-title">Active Auctions</h2>
      <div className="active-auction-list">
        {auctions.map((auction) => (
          <div key={auction._id} className="active-auction-card">
            <h3>{auction.title}</h3>
            <p className="active-desc">{auction.desc}</p>
            <p className="active-price">Current Bid: <span>${auction.currentPrice}</span></p>
            <p className="active-end-time">Ends: {new Date(auction.endTime).toLocaleString()}</p>
            <button onClick={() => navigate(`/seller-dashboard/live-auction/${auction._id}`)}>
              View Live Auction
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAuctions;