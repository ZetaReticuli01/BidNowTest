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






import React, { useState, useEffect } from "react";
import { Outlet, Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BidDetails from "../components/BidDetails";
import "../styles/BidderDashboard.css";

const BidderDashboard = () => {
  const { id } = useParams(); // Get auctionId from URL (e.g., /bidder-dashboard/auction/:id)
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:9000/api/auction", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(response.data); // Assuming response.data is an array of auctions
        setLoading(false);
      } catch (err) {
        setError("Failed to load auctions.");
        setLoading(false);
        console.error("Auction fetch error:", err);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
        {id && (
          <BidDetails
            auctionId={id}
            initialPrice={auctions.find((a) => a._id === id)?.currentPrice || 0}
          />
        )}
        <Outlet /> {/* Render nested routes like /auctions or /history */}
      </div>
    </div>
  );
};

export default BidderDashboard;