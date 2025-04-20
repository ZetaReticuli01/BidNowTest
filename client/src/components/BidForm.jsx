import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/BidForm.css";

const BidForm = ({ auctionId, currentPrice, socket }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("loading"); // Track auction status

  useEffect(() => {
    const fetchAuctionStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching auction status for auctionId:", auctionId, "with token:", token);
        const response = await axios.get(`http://localhost:9000/api/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Auction status response:", response.data);
        setAuctionStatus(response.data.status);
      } catch (err) {
        console.error("Error fetching auction status:", err.message, err.response?.data);
        setError("Failed to load auction status.");
        setAuctionStatus("error");
      }
    };
    fetchAuctionStatus();
  }, [auctionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with amount:", amount, "auctionStatus:", auctionStatus);
    setError("");
    setSuccess(false);

    if (auctionStatus !== "active") {
      console.log("Bidding blocked: Auction status is not active");
      setError("Bidding is only allowed on active auctions.");
      return;
    }

    if (!amount || parseFloat(amount) <= parseFloat(currentPrice)) {
      console.log("Invalid bid amount:", amount, "currentPrice:", currentPrice);
      setError("Bid must be higher than the current price.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const bidder = localStorage.getItem("userId");
      const name = localStorage.getItem("name") || "Bidder";
      console.log("Submitting bid with token:", token, "bidder:", bidder, "name:", name);

      if (!token || !bidder) {
        console.log("No token or bidder ID found");
        setError("Please log in to place a bid.");
        return;
      }

      const response = await axios.post(
        "http://localhost:9000/api/bids/place",
        { auction: auctionId, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Bid placed successfully:", response.data);

      socket.emit("placeBid", {
        auction: auctionId,
        bidder: { id: bidder, name },
        amount: response.data.amount,
      });
      console.log("Socket event emitted:", { auction: auctionId, bidder, amount: response.data.amount });

      setAmount("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Error placing bid:", err.message, err.response?.data);
      const errorMessage =
        err.response?.status === 400
          ? err.response.data.error || err.response.data.err
          : "Failed to place bid due to a server issue.";
      setError(errorMessage);
    }
  };

  return (
    <div className="bid-form">
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter bid amount"
          min={parseFloat(currentPrice) + 0.01}
          step="0.01"
          required
          disabled={auctionStatus !== "active"}
        />
        <button type="submit" disabled={auctionStatus !== "active"}>
          Place Bid
        </button>
      </form>
      {error && <p className="bid-form-error">{error}</p>}
      {success && <span className="bid-success">✓</span>}
    </div>
  );
};

export default BidForm;









// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/BidForm.css";

// const BidForm = ({ auctionId, currentPrice, socket }) => {
//   const [amount, setAmount] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [auctionDetails, setAuctionDetails] = useState(null); // Store full auction details

//   useEffect(() => {
//     const fetchAuctionDetails = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         console.log("Fetching auction details for auctionId:", auctionId, "with token:", token);
//         const response = await axios.get(`http://localhost:9000/api/auction/${auctionId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Auction details response:", response.data);
//         setAuctionDetails(response.data);
//       } catch (err) {
//         console.error("Error fetching auction details:", err.message, err.response?.data);
//         setError("Failed to load auction details.");
//         setAuctionDetails({ status: "error" });
//       }
//     };
//     fetchAuctionDetails();
//   }, [auctionId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Form submitted with amount:", amount, "auctionDetails:", auctionDetails);
//     setError("");
//     setSuccess(false);

//     if (!auctionDetails || !auctionDetails.startTime || !auctionDetails.endTime) {
//       console.log("Invalid auction details");
//       setError("Auction details unavailable.");
//       return;
//     }

//     const now = new Date();
//     const startTime = new Date(auctionDetails.startTime);
//     const endTime = new Date(auctionDetails.endTime);
//     console.log("Time check - now:", now, "startTime:", startTime, "endTime:", endTime);

//     if (now < startTime || now > endTime) {
//       console.log("Bidding blocked: Auction not currently active");
//       setError("Bidding is only allowed during the auction period.");
//       return;
//     }

//     if (!amount || parseFloat(amount) <= parseFloat(currentPrice)) {
//       console.log("Invalid bid amount:", amount, "currentPrice:", currentPrice);
//       setError("Bid must be higher than the current price.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const bidder = localStorage.getItem("userId");
//       const name = localStorage.getItem("name") || "Bidder";
//       console.log("Submitting bid with token:", token, "bidder:", bidder, "name:", name);

//       if (!token || !bidder) {
//         console.log("No token or bidder ID found");
//         setError("Please log in to place a bid.");
//         return;
//       }

//       const response = await axios.post(
//         "http://localhost:9000/api/bids/place",
//         { auction: auctionId, amount: parseFloat(amount) },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Bid placed successfully:", response.data);

//       socket.emit("placeBid", {
//         auction: auctionId,
//         bidder: { id: bidder, name },
//         amount: response.data.amount,
//       });
//       console.log("Socket event emitted:", { auction: auctionId, bidder, amount: response.data.amount });

//       setAmount("");
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 2000);
//     } catch (err) {
//       console.error("Error placing bid:", err.message, err.response?.data);
//       const errorMessage =
//         err.response?.status === 400
//           ? err.response.data.error || err.response.data.err
//           : "Failed to place bid due to a server issue.";
//       setError(errorMessage);
//     }
//   };

//   return (
//     <div className="bid-form">
//       <form onSubmit={handleSubmit}>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           placeholder="Enter bid amount"
//           min={parseFloat(currentPrice) + 0.01}
//           step="0.01"
//           required
//           disabled={!auctionDetails || new Date(auctionDetails.startTime) > new Date() || new Date(auctionDetails.endTime) <= new Date()}
//         />
//         <button
//           type="submit"
//           disabled={!auctionDetails || new Date(auctionDetails.startTime) > new Date() || new Date(auctionDetails.endTime) <= new Date()}
//         >
//           Place Bid
//         </button>
//       </form>
//       {error && <p className="bid-form-error">{error}</p>}
//       {success && <span className="bid-success">✓</span>}
//     </div>
//   );
// };

// export default BidForm;