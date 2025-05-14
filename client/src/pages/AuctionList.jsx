import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BidCard from "../components/BidCard";
import "../styles/AuctionList.css";

const AuctionList = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching auctions with token:", token);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response:", response.data);
        const now = new Date();
        console.log("Current time:", now);
        const activeAuctions = response.data.filter((auction) => {
          console.log("Checking auction:", auction);
          return (
            auction.status === "active" &&
            new Date(auction.endTime) > now
          );
        });
        console.log("Filtered active auctions:", activeAuctions);
        setAuctions(activeAuctions);
      } catch (err) {
        console.error("Error fetching auctions:", err.message, err.response?.data);
        setError("Failed to load auctions.");
      } finally {
        setLoading(false);
        console.log("Loading state set to false");
      }
    };

    fetchAuctions();
    const interval = setInterval(fetchAuctions, 60000); // Refresh every minute
    console.log("Interval set for refreshing auctions every 60 seconds");
    return () => {
      clearInterval(interval);
      console.log("Interval cleared on component unmount");
    };
  }, []);

  if (loading) return <p className="auction-loading">Loading auctions...</p>;
  if (error) return <p className="auction-error">{error}</p>;
  if (auctions.length === 0) return <p className="auction-no-auctions">No active auctions available.</p>;

  return (
    <div className="auction-list-container">
      <h2 className="auction-section-title">Active Auctions</h2>
      <div className="auction-list">
        {auctions.map((auction) => (
          <BidCard key={auction._id} auction={auction} onClick={() => navigate(`/bidder-dashboard/auction/${auction._id}`)} />
        ))}
      </div>
    </div>
  );
};

export default AuctionList;












// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import BidCard from "../components/BidCard";
// import "../styles/AuctionList.css";

// const AuctionList = () => {
//   const navigate = useNavigate();
//   const [auctions, setAuctions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAuctions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         console.log("Fetching auctions with token:", token);
//         const response = await axios.get("http://localhost:9000/api/auction", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("API response:", response.data);
//         const now = new Date();
//         console.log("Current time:", now);
//         const activeAuctions = response.data.filter((auction) => {
//           const startTime = new Date(auction.startTime);
//           const endTime = new Date(auction.endTime);
//           console.log("Checking auction:", auction._id, "startTime:", startTime, "endTime:", endTime, "status:", auction.status);
//           return startTime <= now && endTime > now; // Only show auctions currently running
//         });
//         console.log("Filtered active auctions:", activeAuctions);
//         setAuctions(activeAuctions);
//       } catch (err) {
//         console.error("Error fetching auctions:", err.message, err.response?.data);
//         setError("Failed to load auctions.");
//       } finally {
//         setLoading(false);
//         console.log("Loading state set to false");
//       }
//     };

//     fetchAuctions();
//     const interval = setInterval(fetchAuctions, 60000); // Refresh every minute
//     console.log("Interval set for refreshing auctions every 60 seconds");
//     return () => {
//       clearInterval(interval);
//       console.log("Interval cleared on component unmount");
//     };
//   }, []);

//   if (loading) return <p className="auction-loading">Loading auctions...</p>;
//   if (error) return <p className="auction-error">{error}</p>;
//   if (auctions.length === 0) return <p className="auction-no-auctions">No active auctions available.</p>;

//   return (
//     <div className="auction-list-container">
//       <h2 className="auction-section-title">Active Auctions</h2>
//       <div className="auction-list">
//         {auctions.map((auction) => (
//           <BidCard key={auction._id} auction={auction} onClick={() => navigate(`/bidder-dashboard/auction/${auction._id}`)} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AuctionList;