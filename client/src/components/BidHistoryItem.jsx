import React from "react";
import "../styles/BidHistoryItem.css";

const BidHistoryItem = ({ bid, onContactSeller }) => {
  return (
    <div className="bid-history-item">
      <h3>{bid.auction?.title || "Unknown Auction"}</h3>
      <p>Bid Amount: <span>${bid.amount}</span></p>
      <p>Status: <span>{bid.outcome}</span></p>
      <p>Bid Time: {new Date(bid.bidTime).toLocaleString()}</p>
      {bid.outcome === "Won" && (
        <button className="contact-seller-button" onClick={onContactSeller}>
          Contact Seller
        </button>
      )}
    </div>
  );
};

export default BidHistoryItem;