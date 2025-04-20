// import React from "react";
// import { Outlet, Link } from "react-router-dom";
// import "../styles/BidderDashboard.css";

// const BidderDashboard = () => {
//   return (
//     <div className="bidder-dashboard">
//       <nav className="bidder-nav">
//         <h2>Bidder Dashboard</h2>
//         <ul>
//           <li><Link to="/bidder-dashboard/auctions">Auctions</Link></li>
//           <li><Link to="/bidder-dashboard/history">History</Link></li>
//           <li><Link to="/" onClick={() => localStorage.clear()}>Logout</Link></li>
//         </ul>
//       </nav>
//       <div className="bidder-content">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default BidderDashboard;




import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import BidForm from "../components/BidForm";
import "../styles/BidderDashboard.css";

const BidderDashboard = () => {
  const { id } = useParams(); // Get auctionId from URL (e.g., /bidder-dashboard/auction/:id)
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:9000", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = newSocket;

    const fetchAuctionDetails = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching auction details, auctionId:", id, "token:", token);
        const response = await axios.get(`http://localhost:9000/api/auction/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Auction details response:", response.data);
        setAuction(response.data);
      } catch (err) {
        console.error("Error fetching auction details:", err.message, err.response?.data);
        setError(`Failed to load auction details: ${err.message}`);
      }
    };

    const fetchBidHistory = async () => {
      if (!id) return;
      try {
        console.log("Fetching bid history, auctionId:", id);
        const response = await axios.get(`http://localhost:9000/api/bids/bidsByAuction/${id}`);
        console.log("Fetched bids:", response.data.bids);
        setBids(response.data.bids);
      } catch (err) {
        console.error("Error fetching bids:", err.message, err.response?.data);
        setError((prev) => prev ? `${prev}\nFailed to load bid history: ${err.message}` : `Failed to load bid history: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionDetails();
      fetchBidHistory();

      newSocket.emit("joinAuction", id);
      console.log("Joined auction room:", id);

      const handleNewBid = (newBid) => {
        console.log("New bid received in room:", id, newBid);
        const bidWithTimestamp = { ...newBid, timeStamp: new Date() };
        setBids((prevBids) => {
          const existingBid = prevBids.find((bid) => bid.bidder?.id === newBid.bidder?.id);
          if (!existingBid) {
            return [bidWithTimestamp, ...prevBids];
          }
          return prevBids.map((bid) =>
            bid.bidder?.id === newBid.bidder?.id ? bidWithTimestamp : bid
          );
        });
        setAuction((prevAuction) => ({
          ...prevAuction,
          currentPrice: newBid.amount,
        }));
      };

      newSocket.on("newBid", handleNewBid);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        newSocket.emit("joinAuction", id);
      });
      newSocket.on("disconnect", () => console.log("Socket disconnected"));
      newSocket.on("connect_error", (err) => console.error("Socket connection error:", err));
      newSocket.on("reconnect", () => {
        console.log("Socket reconnected, rejoining room:", id);
        newSocket.emit("joinAuction", id);
      });
    }

    return () => {
      if (newSocket && id) {
        newSocket.emit("leaveAuction", id);
        console.log("Left auction room:", id);
        newSocket.off("newBid", handleNewBid);
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("reconnect");
        newSocket.close();
      }
    };
  }, [id]);

  if (loading && id) return <p className="loading">Loading...</p>;
  if (error && id) return <p className="error">{error}</p>;

  return (
    <div className="bidder-dashboard">
      <nav className="bidder-nav">
        <h2>Bidder Dashboard</h2>
        <ul>
          <li><Link to="/bidder-dashboard/auctions">Auctions</Link></li>
          <li><Link to="/bidder-dashboard/history">History</Link></li>
          <li><Link to="/" onClick={() => localStorage.clear()}>Logout</Link></li>
        </ul>
      </nav>
      <div className="bidder-content">
        {id && auction && (
          <div className="auction-detail">
            <div className="auction-header">
              <h2>{auction.title}</h2>
              <img src={`http://localhost:9000/uploads/${auction.productImages[0]}`} alt={auction.title} className="auction-image" />
            </div>
            <div className="auction-info">
              <p className="description">{auction.desc}</p>
              <p className="current-price">Current Price: <span>${auction.currentPrice}</span></p>
              <p className="end-time">Ends: {new Date(auction.endTime).toLocaleString()}</p>
            </div>
            <div className="bid-section">
              <h3>Place Your Bid</h3>
              <BidForm auctionId={id} currentPrice={auction.currentPrice} socket={socketRef.current} />
            </div>
            <div className="bid-history">
              <h3>Bid History</h3>
              {bids.length === 0 ? (
                <p>No bids placed yet. Be the first!</p>
              ) : (
                <ul className="bids-list">
                  {bids.map((bid, index) => (
                    <li key={index} className="bid-item">
                      <span className="bidder-name">{bid.bidder?.name || "Unknown"}</span>
                      <span className="bid-amount">${bid.amount}</span>
                      <span className="bid-time">{new Date(bid.timeStamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <Outlet /> {/* Render nested routes like /auctions or /history */}
      </div>
    </div>
  );
};

export default BidderDashboard;