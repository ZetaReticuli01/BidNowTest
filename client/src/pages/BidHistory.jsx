// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import BidHistoryItem from "../components/BidHistoryItem";
// import "../styles/BidHistory.css";

// const BidHistory = () => {
//   const [bids, setBids] = useState([]);
//   const [filteredBids, setFilteredBids] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     const fetchBids = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const userId = localStorage.getItem("userId");
//         if (!token || !userId) {
//           setError("User not authenticated.");
//           setLoading(false);
//           return;
//         }
//         const response = await axios.get(`http://localhost:9000/api/bid/bidsByUser/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Fetched bids:", response.data.bids);
//         const enrichedBids = response.data.bids.map(bid => ({
//           ...bid,
//           auctionStatus: bid.auction.status || "Unknown",
//           outcome: determineOutcome(bid)
//         }));
//         setBids(enrichedBids);
//         setFilteredBids(enrichedBids); // Initial filter matches all
//       } catch (err) {
//         setError("Failed to load bid history.");
//         console.error("Bid history error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBids();
//   }, []);

//   // Determine outcome based on bid and auction data
//   const determineOutcome = (bid) => {
//     if (!bid.auction || !bid.auction.status) return "Unknown";
//     if (bid.auction.status === "completed" && bid.amount === bid.auction.currentPrice) {
//       return "Won";
//     } else if (bid.auction.status === "completed" && bid.amount < bid.auction.currentPrice) {
//       return "Outbid";
//     } else if (bid.auction.status === "expired") {
//       return "Expired";
//     } else {
//       return "Active";
//     }
//   };

//   // Apply filters
//   useEffect(() => {
//     let result = [...bids];
//     if (filterStatus !== "All") {
//       result = result.filter(bid => bid.outcome === filterStatus || bid.auctionStatus === filterStatus);
//     }
//     if (startDate) {
//       result = result.filter(bid => new Date(bid.bidTime) >= new Date(startDate));
//     }
//     if (endDate) {
//       result = result.filter(bid => new Date(bid.bidTime) <= new Date(endDate));
//     }
//     setFilteredBids(result);
//   }, [filterStatus, startDate, endDate, bids]);

//   const handleStatusChange = (e) => {
//     setFilterStatus(e.target.value);
//   };

//   const handleStartDateChange = (e) => {
//     setStartDate(e.target.value);
//   };

//   const handleEndDateChange = (e) => {
//     setEndDate(e.target.value);
//   };

//   if (loading) return <p className="bid-history-loading">Loading...</p>;
//   if (error) return <p className="bid-history-error">{error}</p>;
//   if (filteredBids.length === 0) return <p className="bid-history-no-bids">No bid history matches the filters.</p>;

//   return (
//     <div className="bid-history">
//       <h2>Bid History</h2>
//       <div className="filter-section">
//         <label>
//           Filter by Status:
//           <select value={filterStatus} onChange={handleStatusChange}>
//             <option value="All">All</option>
//             <option value="Won">Won</option>
//             <option value="Outbid">Outbid</option>
//             <option value="Expired">Expired</option>
//             <option value="Active">Active</option>
//           </select>
//         </label>
//         <label>
//           Start Date:
//           <input type="date" value={startDate} onChange={handleStartDateChange} />
//         </label>
//         <label>
//           End Date:
//           <input type="date" value={endDate} onChange={handleEndDateChange} />
//         </label>
//       </div>
//       <div className="bid-history-list">
//         {filteredBids.map((bid) => (
//           <BidHistoryItem key={bid._id} bid={bid} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BidHistory;



import React, { useEffect, useState } from "react";
import axios from "axios";
import BidHistoryItem from "../components/BidHistoryItem";
import "../styles/BidHistory.css";

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("Attempting to fetch bids, userId:", userId, "token exists:", !!token);
        if (!token || !userId) {
          setError("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:9000/api/bids/bidsByUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", response.data);

        const enrichedBids = await Promise.all(response.data.bids.map(async (bid) => {
          let auctionStatus = "Unknown";
          let currentPrice = bid.amount; // Default to bid amount if auction data is incomplete
          let outcome = "Unknown";

          // Fetch auction details if status or currentPrice is missing
          if (!bid.auction || !bid.auction.status || !bid.auction.currentPrice) {
            try {
              const auctionResponse = await axios.get(`http://localhost:9000/api/auction/${bid.auctionId || bid.auction?._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log("Auction details for bid:", auctionResponse.data);
              auctionStatus = auctionResponse.data.status || "Unknown";
              currentPrice = auctionResponse.data.currentPrice || bid.amount;
            } catch (auctionErr) {
              console.error("Error fetching auction details for bid:", auctionErr.message);
            }
          } else {
            auctionStatus = bid.auction.status || "Unknown";
            currentPrice = bid.auction.currentPrice || bid.amount;
          }

          outcome = determineOutcome(bid.amount, currentPrice, auctionStatus);
          return {
            ...bid,
            auctionStatus,
            outcome,
            currentPrice, // Add currentPrice to bid object for reference
          };
        }));

        setBids(enrichedBids);
        setFilteredBids(enrichedBids);
      } catch (err) {
        console.error("Bid history fetch error:", err.message, err.response?.status, err.response?.data);
        setError(`Failed to load bid history: ${err.message} (Status: ${err.response?.status})`);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const determineOutcome = (bidAmount, currentPrice, status) => {
    if (!status) return "Unknown";
    if (status === "completed") {
      if (bidAmount === currentPrice) return "Won";
      if (bidAmount < currentPrice) return "Outbid";
    } else if (status === "expired") {
      return "Expired";
    } else if (status === "active") {
      return "Active";
    }
    return "Unknown";
  };

  useEffect(() => {
    let result = [...bids];
    if (filterStatus !== "All") {
      result = result.filter(bid => bid.outcome === filterStatus || bid.auctionStatus === filterStatus);
    }
    if (startDate) {
      result = result.filter(bid => new Date(bid.bidTime) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(bid => new Date(bid.bidTime) <= new Date(endDate));
    }
    setFilteredBids(result);
  }, [filterStatus, startDate, endDate, bids]);

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  if (loading) return <p className="bid-history-loading">Loading...</p>;
  if (error) return <p className="bid-history-error">{error}</p>;
  if (filteredBids.length === 0) return <p className="bid-history-no-bids">No bid history matches the filters.</p>;

  return (
    <div className="bid-history">
      <h2>Bid History</h2>
      <div className="filter-section">
        <label>
          Filter by Status:
          <select value={filterStatus} onChange={handleStatusChange}>
            <option value="All">All</option>
            <option value="Won">Won</option>
            <option value="Outbid">Outbid</option>
            {/* <option value="Expired">Expired</option> */}
            <option value="Active">Active</option>
          </select>
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </label>
      </div>
      <div className="bid-history-list">
        {filteredBids.map((bid) => (
          <BidHistoryItem key={bid._id} bid={bid} />
        ))}
      </div>
    </div>
  );
};

export default BidHistory;