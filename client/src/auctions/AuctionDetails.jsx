import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AuctionDetails.css";

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/auction/${id}`);
        setAuction(response.data);
      } catch (err) {
        setError("Failed to load auction details");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctionDetails();
  }, [id]);

  if (loading) return <p className="loading">Loading auction details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!auction) return <p className="error">Auction not found</p>;

  return (
    <div className="auction-details">
      <div className="details-card">
        <h2 className="auction-title">{auction.title}</h2>
        <p className="desc">{auction.desc}</p>
        <p className="price">Starting Price: <span>${auction.startingPrice}</span></p>
        <p className="current-price">Current Price: <span>${auction.currentPrice}</span></p>
        <p className="seller">Seller: <span>{auction.seller?.name || "Unknown"}</span></p>
        <p className="end-time">Ends At: <span>{new Date(auction.endTime).toLocaleString()}</span></p>
      </div>
    </div>
  );
};

export default AuctionDetails;
