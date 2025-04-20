import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuctionList.css";

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/auction");
        setAuctions(response.data);
      } catch (err) {
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return null;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="auction-list">
        <h2>Live Auctions</h2>
        <div className="auctions-container">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="auction-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-button"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="auction-list">
      <h2>Live Auctions</h2>
      <div className="auctions-container">
        {auctions.filter(auction => new Date(auction.endTime) > new Date()).map((auction) => (
          <div key={auction._id} className="auction-card">
            <h3>{auction.title}</h3>
            <p className="price">Current Price: ${auction.currentPrice}</p>
            <p className="seller">Seller: {auction.seller.name}</p>
            <p className="time-left">
              Time Left: {formatTimeLeft(new Date(auction.endTime) - new Date())}
            </p>
            <button onClick={() => navigate(`/auction/${auction._id}`)} className="details-button">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionList;
