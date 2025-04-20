import React, { useEffect, useState } from "react";
import axios from "axios";
import BidHistoryItem from "../components/BidHistoryItem";
import "../styles/BidHistory.css";

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:9000/api/bid/bidsByUser/${localStorage.getItem("userId")}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBids(response.data.bids);
      } catch (err) {
        setError("Failed to load bid history.");
        console.error("Bid history error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) return <p className="bid-history-loading">Loading...</p>;
  if (error) return <p className="bid-history-error">{error}</p>;
  if (bids.length === 0) return <p className="bid-history-no-bids">No bid history.</p>;

  return (
    <div className="bid-history">
      <h2>Bid History</h2>
      <div className="bid-history-list">
        {bids.map((bid) => (
          <BidHistoryItem key={bid._id} bid={bid} />
        ))}
      </div>
    </div>
  );
};

export default BidHistory;