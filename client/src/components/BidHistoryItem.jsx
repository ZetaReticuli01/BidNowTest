import React from "react";
import "../styles/BidHistoryItem.css";

const BidHistoryItem = ({ bid }) => {
  return (
    <div className="bid-history-item">
      <p><strong>Auction:</strong> {bid.auction.title} (ID: {bid.auction._id})</p>
      <p><strong>Amount:</strong> ${bid.amount}</p>
      <p><strong>Time:</strong> {new Date(bid.bidTime).toLocaleString()}</p>
      <p><strong>Status:</strong> {bid.auctionStatus}</p>
      <p><strong>Outcome:</strong> <span className={bid.outcome === "Won" ? "won" : bid.outcome === "Outbid" ? "lost" : ""}>{bid.outcome}</span></p>
    </div>
  );
};

export default BidHistoryItem;