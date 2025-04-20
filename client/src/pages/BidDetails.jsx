import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BidForm from "../components/BidForm";
import "../styles/BidDetails.css";

const BidDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:9000/api/auction/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuction(response.data);
      } catch (err) {
        setError("Failed to load auction details.");
        console.error("Auction details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  if (loading) return <p className="bid-details-loading">Loading...</p>;
  if (error) return <p className="bid-details-error">{error}</p>;
  if (!auction) return <p className="bid-details-error">Auction not found.</p>;

  return (
    <div className="bid-details">
      <h2>{auction.title}</h2>
      <img src={`http://localhost:9000/uploads/${auction.productImages[0]}`} alt={auction.title} className="auction-image" />
      <p>{auction.desc}</p>
      <p>Current Price: ${auction.currentPrice}</p>
      <p>Ends: {new Date(auction.endTime).toLocaleString()}</p>
      <BidForm auctionId={id} currentPrice={auction.currentPrice} />
    </div>
  );
};

export default BidDetails;