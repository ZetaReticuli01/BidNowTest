import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BidCard from "../components/BidCard";
import "../styles/BidderAuctionList.css";

const BidderAuctionList = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching auctions with token:", token);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched auctions:", response.data);

        // Filter for active auctions only (between startTime and endTime)
        const now = new Date();
        const activeAuctions = response.data.filter((auction) => {
          const startTime = new Date(auction.startTime);
          const endTime = new Date(auction.endTime);
          return now >= startTime && now <= endTime;
        });
        setAuctions(activeAuctions);
      } catch (err) {
        console.error("Auction fetch error:", err.message, err.response?.data);
        setError("Failed to load auctions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
    const interval = setInterval(fetchAuctions, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="auction-loading">Loading auctions...</p>;
  if (error) return <p className="auction-error">{error}</p>;
  if (auctions.length === 0) return <p className="auction-no-auctions">No active auctions.</p>;

  return (
    <div className="bidder-auction-list">
      <h2>Active Auctions</h2>
      <div className="auction-grid">
        {auctions.map((auction) => (
          <BidCard key={auction._id} auction={auction} onClick={() => navigate(`/bidder-dashboard/auction/${auction._id}`)} />
        ))}
      </div>
    </div>
  );
};

export default BidderAuctionList;