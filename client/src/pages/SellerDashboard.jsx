import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SellerDashboard.css";

const SellerDashboard = () => {
  const navigate = useNavigate();

  console.log("SellerDashboard localStorage:", {
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId"),
    role: localStorage.getItem("role"),
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Seller Dashboard</h1>
        <button className="create-auction-btn" onClick={() => navigate("/create-auction")}>
          + Create New Auction
        </button>
      </div>

      <div className="auction-section">
        <h2>Manage Auctions</h2>
        <button className="dashboard-button" onClick={() => navigate("/seller-dashboard/active")}>
          Active Auctions
        </button>
        <button className="dashboard-button" onClick={() => navigate("/seller-dashboard/scheduled")}>
          Scheduled Auctions
        </button>
        <button className="dashboard-button" onClick={() => navigate("/seller-dashboard/completed")}>
          Completed Auctions
        </button>
      </div>
    </div>
  );
};

export default SellerDashboard;