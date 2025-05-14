import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BidHistoryItem from "../components/BidHistoryItem";
import "../styles/BidHistory.css";

const BidHistory = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("Fetching bids, userId:", userId, "token exists:", !!token);
        if (!token || !userId) {
          setError("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:9000/api/bids/bidsByUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Bids API Response:", response.data);

        const enrichedBids = await Promise.all(response.data.bids.map(async (bid) => {
          let auctionStatus = "Unknown";
          let currentPrice = bid.amount;
          let outcome = "Unknown";
          let seller = null;
          let auctionData = bid.auction || {};

          try {
            const auctionId = bid.auctionId || bid.auction?._id;
            if (!auctionId) {
              console.warn("No auctionId for bid:", bid._id);
              return { ...bid, auctionStatus, outcome, currentPrice, seller };
            }
            console.log("Fetching auction details for auctionId:", auctionId);
            const auctionResponse = await axios.get(`http://localhost:9000/api/auction/${auctionId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            auctionData = auctionResponse.data;
            console.log("Auction details response:", {
              id: auctionData._id,
              title: auctionData.title,
              seller: auctionData.seller,
            });
            auctionStatus = auctionData.status || "Unknown";
            currentPrice = auctionData.currentPrice || bid.amount;
            seller = auctionData.seller || null;
            if (!seller) {
              console.warn("No seller data for auction:", auctionId);
            } else if (typeof seller === "string") {
              console.warn("Seller is an ObjectId, not populated:", seller);
            }
          } catch (auctionErr) {
            console.error("Error fetching auction details for bid:", auctionErr.message, auctionErr.response?.data);
          }

          outcome = determineOutcome(bid.amount, currentPrice, auctionStatus);
          return {
            ...bid,
            auction: auctionData,
            auctionStatus,
            outcome,
            currentPrice,
            seller,
          };
        }));

        setBids(enrichedBids);
        setFilteredBids(enrichedBids);
      } catch (err) {
        console.error("Bid history fetch error:", err.message, err.response?.status, err.response?.data);
        setError(`Failed to load bid history: ${err.message} (Status: ${err.response?.status})`);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const determineOutcome = (bidAmount, currentPrice, status) => {
    if (!status) return "Unknown";
    if (status === "completed") {
      if (bidAmount === currentPrice) return "Won";
      if (bidAmount < currentPrice) return "Outbid";
    } else if (status === "expired") {
      return "Expired";
    } else if (status === "active") {
      return "Active";
    }
    return "Unknown";
  };

  const handleContactSeller = (auctionId, sellerId) => {
    console.log("Attempting to contact seller:", { auctionId, sellerId });
    if (!sellerId) {
      alert("Seller information not available. Please try again later.");
      return;
    }
    navigate(`/chat/${auctionId}/${sellerId}`);
  };

  useEffect(() => {
    let result = [...bids];
    if (filterStatus !== "All") {
      result = result.filter(bid => bid.outcome === filterStatus || bid.auctionStatus === filterStatus);
    }
    if (startDate) {
      result = result.filter(bid => new Date(bid.bidTime) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(bid => new Date(bid.bidTime) <= new Date(endDate));
    }
    setFilteredBids(result);
  }, [filterStatus, startDate, endDate, bids]);

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  if (loading) return <p className="bid-history-loading">Loading...</p>;
  if (error) return <p className="bid-history-error">{error}</p>;
  if (filteredBids.length === 0) return <p className="bid-history-no-bids">No bid history matches the filters.</p>;

  return (
    <div className="bid-history">
      <h2>Bid History</h2>
      <div className="filter-section">
        <label>
          Filter by Status:
          <select value={filterStatus} onChange={handleStatusChange}>
            <option value="All">All</option>
            <option value="Won">Won</option>
            <option value="Outbid">Outbid</option>
            <option value="Active">Active</option>
          </select>
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </label>
      </div>
      <div className="bid-history-list">
        {filteredBids.map((bid) => (
          <BidHistoryItem
            key={bid._id}
            bid={bid}
            onContactSeller={() => handleContactSeller(bid.auctionId || bid.auction?._id, bid.seller?._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BidHistory;