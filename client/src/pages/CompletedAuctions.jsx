import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CompletedAuctions.css";

const CompletedAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletedAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/seller/status?status=completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(response.data);
    } catch (err) {
      setError("Failed to load completed auctions.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactBidder = (auctionId, highestBidderId) => {
    if (!highestBidderId) {
      alert("No highest bidder for this auction.");
      return;
    }
    navigate(`/chat/${auctionId}/${highestBidderId}`);
  };

  useEffect(() => {
    fetchCompletedAuctions();
    const interval = setInterval(fetchCompletedAuctions, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="completed-loading">Loading completed auctions...</p>;
  if (error) return <p className="completed-error">{error}</p>;
  if (auctions.length === 0) return <p className="completed-no-auctions">No completed auctions.</p>;

  return (
    <div className="completed-auctions-container">
      <h2 className="completed-section-title">Completed Auctions</h2>
      <div className="completed-auction-list">
        {auctions.map((auction) => (
          <div key={auction._id} className="completed-auction-card">
            <h3>{auction.title}</h3>
            <p className="completed-desc">{auction.desc}</p>
            <p className="completed-price">Final Price: <span>${auction.currentPrice}</span></p>
            <p className="completed-bidder">Highest Bidder: {auction.highestBidder?.name || "No bids"}</p>
            <p className="completed-end-time">Ended: {new Date(auction.endTime).toLocaleString()}</p>
            {auction.highestBidder && (
              <button
                className="contact-bidder-button"
                onClick={() => handleContactBidder(auction._id, auction.highestBidder._id)}
              >
                Contact Highest Bidder
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedAuctions;