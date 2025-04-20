import React from "react";
import "../styles/BidHistoryItem.css";

const BidHistoryItem = ({ bid }) => {
  return (
    <div className="bid-history-item">
      <p>Auction: {bid.auction.title}</p>
      <p>Amount: ${bid.amount}</p>
      <p>Time: {new Date(bid.bidTime).toLocaleString()}</p>
    </div>
  );
};

export default BidHistoryItem;