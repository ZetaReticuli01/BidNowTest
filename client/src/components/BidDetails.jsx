import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import BidForm from "./BidForm";
import "../styles/BidDetails.css";

const BidDetails = ({ auctionId, initialPrice }) => {
  const [currentPrice, setCurrentPrice] = useState(initialPrice || 0);
  const socket = io("http://localhost:9000");

  useEffect(() => {
    socket.emit("joinAuction", auctionId);

    socket.on("newBid", (data) => {
      if (data.auction === auctionId && data.amount > currentPrice) {
        setCurrentPrice(data.amount);
      }
    });

    return () => {
      socket.emit("leaveAuction", auctionId);
      socket.disconnect();
    };
  }, [auctionId, currentPrice]);

  return (
    <div className="bid-details">
      <h3>Auction Details</h3>
      <p>Current Price: ${currentPrice}</p>
      <BidForm auctionId={auctionId} currentPrice={currentPrice} socket={socket} />
    </div>
  );
};

export default BidDetails;