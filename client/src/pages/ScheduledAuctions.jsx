import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ScheduledAuctions.css";

const ScheduledAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScheduledAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:9000/api/auction/seller/status?status=scheduled", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(response.data);
    } catch (err) {
      setError("Failed to load scheduled auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledAuctions();
    const interval = setInterval(fetchScheduledAuctions, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Check start times and trigger refresh when an auction starts
  useEffect(() => {
    const checkStartTimes = () => {
      const now = new Date();
      const startingAuctions = auctions.filter((auction) => new Date(auction.startTime) <= now);
      if (startingAuctions.length > 0) {
        fetchScheduledAuctions(); // Refresh to move to Active Auctions
      }
    };
    const interval = setInterval(checkStartTimes, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [auctions]);

  if (loading) return <p className="scheduled-loading">Loading scheduled auctions...</p>;
  if (error) return <p className="scheduled-error">{error}</p>;
  if (auctions.length === 0) return <p className="scheduled-no-auctions">No scheduled auctions.</p>;

  return (
    <div className="scheduled-auctions-container">
      <h2 className="scheduled-section-title">Scheduled Auctions</h2>
      <div className="scheduled-auction-list">
        {auctions.map((auction) => (
          <div key={auction._id} className="scheduled-auction-card">
            <h3>{auction.title}</h3>
            <p className="scheduled-desc">{auction.desc}</p>
            <p className="scheduled-start-time">Starts: {new Date(auction.startTime).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledAuctions;