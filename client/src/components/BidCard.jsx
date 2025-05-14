import React from "react";
import "../styles/BidCard.css";

const BidCard = ({ auction, onClick }) => {
  const imageUrl = auction.productImages && auction.productImages.length > 0
    ? `${import.meta.env.VITE_API_URL}/uploads/${auction.productImages[0]}`
    : "https://via.placeholder.com/200";

  return (
    <div className="bid-card" onClick={onClick}>
      <img src={imageUrl} alt={auction.title} className="bid-card-image" />
      <h3 className="bid-card-title">{auction.title}</h3>
      <p className="bid-card-price">Current Bid: ${auction.currentPrice}</p>
      <p className="bid-card-end-time">Ends: {new Date(auction.endTime).toLocaleString()}</p>
    </div>
  );
};

export default BidCard;