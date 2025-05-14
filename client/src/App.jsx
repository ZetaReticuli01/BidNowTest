// import React, { Component } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import UserSelection from "./components/UserSelection";
// import AuthForm from "./components/AuthForm";
// import SellerDashboard from "./pages/SellerDashboard";
// import CreateAuction from "./pages/CreateAuction";
// import ActiveAuctions from "./pages/ActiveAuctions";
// import ScheduledAuctions from "./pages/ScheduledAuctions";
// import CompletedAuctions from "./pages/CompletedAuctions";
// import LiveAuctionDetails from "./pages/LiveAuctionDetails";
// import BidderDashboard from "./pages/BidderDashboard";
// import BidderAuctionList from "./pages/BidderAuctionList";
// import BidDetails from "./pages/BidDetails";
// import BidHistory from "./pages/BidHistory";

// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-boundary">
//           <h2>Something went wrong.</h2>
//           <p>{this.state.error.message}</p>
//           <button onClick={() => window.location.reload()}>Reload Page</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// function App() {
//   return (
//     <ErrorBoundary>
//       <Routes>
//         <Route path="/" element={<UserSelection />} />
//         <Route path="/auth/:role" element={<AuthForm />} />
//         <Route path="/seller-dashboard" element={<SellerDashboard />} />
//         <Route path="/seller-dashboard/active" element={<ActiveAuctions />} />
//         <Route path="/seller-dashboard/scheduled" element={<ScheduledAuctions />} />
//         <Route path="/seller-dashboard/completed" element={<CompletedAuctions />} />
//         <Route path="/seller-dashboard/live-auction/:auctionId" element={<LiveAuctionDetails />} />
//         <Route path="/create-auction" element={<CreateAuction />} />
//         <Route path="/bidder-dashboard" element={<BidderDashboard />} />
//         <Route path="/bidder-dashboard/auctions" element={<BidderAuctionList />} />
//         <Route path="/bidder-dashboard/auction/:id" element={<BidDetails />} />
//         <Route path="/bidder-dashboard/history" element={<BidHistory />} />
//         {/* Redirect old /auctions routes to bidder auctions */}
//         <Route path="/auctions" element={<Navigate to="/bidder-dashboard/auctions" />} />
//         <Route path="/auction/:id" element={<Navigate to="/bidder-dashboard/auction/:id" />} />
//       </Routes>
//     </ErrorBoundary>
//   );
// }

// export default App;








// import React, { Component } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import UserSelection from "./components/UserSelection";
// import AuthForm from "./components/AuthForm";
// import SellerDashboard from "./pages/SellerDashboard";
// import CreateAuction from "./pages/CreateAuction";
// import ActiveAuctions from "./pages/ActiveAuctions";
// import ScheduledAuctions from "./pages/ScheduledAuctions";
// import CompletedAuctions from "./pages/CompletedAuctions";
// import LiveAuctionDetails from "./pages/LiveAuctionDetails";
// import BidderDashboard from "./pages/BidderDashboard";
// import BidderAuctionList from "./pages/BidderAuctionList";
// import BidDetails from "./pages/BidDetails";
// import BidHistory from "./pages/BidHistory";

// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-boundary">
//           <h2>Something went wrong.</h2>
//           <p>{this.state.error.message}</p>
//           <button onClick={() => window.location.reload()}>Reload Page</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // Custom hook to redirect based on role after login
// const useAuthRedirect = () => {
//   const location = useLocation();
//   const role = localStorage.getItem("role");

//   React.useEffect(() => {
//     if (location.pathname === "/auth/:role" && role) {
//       if (role === "bidder") {
//         window.location.href = "/bidder-dashboard";
//       } else if (role === "seller") {
//         window.location.href = "/seller-dashboard";
//       }
//     }
//   }, [location, role]);
// };

// function App() {
//   useAuthRedirect();

//   return (
//     <ErrorBoundary>
//       <Routes>
//         <Route path="/" element={<UserSelection />} />
//         <Route path="/auth/:role" element={<AuthForm />} />
//         <Route path="/seller-dashboard" element={<SellerDashboard />} />
//         <Route path="/seller-dashboard/active" element={<ActiveAuctions />} />
//         <Route path="/seller-dashboard/scheduled" element={<ScheduledAuctions />} />
//         <Route path="/seller-dashboard/completed" element={<CompletedAuctions />} />
//         <Route path="/seller-dashboard/live-auction/:auctionId" element={<LiveAuctionDetails />} />
//         <Route path="/create-auction" element={<CreateAuction />} />
//         <Route path="/bidder-dashboard" element={<BidderDashboard />} />
//         <Route path="/bidder-dashboard/auctions" element={<BidderAuctionList />} />
//         <Route path="/bidder-dashboard/auction/:id" element={<BidDetails />} />
//         <Route path="/bidder-dashboard/history" element={<BidHistory />} />
//       </Routes>
//     </ErrorBoundary>
//   );
// }

// export default App;














import React, { Component } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import UserSelection from "./components/UserSelection";
import AuthForm from "./components/AuthForm";
import SellerDashboard from "./pages/SellerDashboard";
import CreateAuction from "./pages/CreateAuction";
import ActiveAuctions from "./pages/ActiveAuctions";
import ScheduledAuctions from "./pages/ScheduledAuctions";
import CompletedAuctions from "./pages/CompletedAuctions";
import LiveAuctionDetails from "./pages/LiveAuctionDetails";
import BidderDashboard from "./pages/BidderDashboard";
import BidderAuctionList from "./pages/BidderAuctionList";
import BidDetails from "./pages/BidDetails"; // Keep this if it's a separate page, or update to "../components/BidDetails" if using components/BidDetails.jsx
import BidHistory from "./pages/BidHistory";
import AuctionList from "./auctions/AuctionList";
import AuctionDetails from "./auctions/AuctionDetails";
import Chat from "./pages/Chat"

// Custom authentication guard
const RequireAuth = ({ children, role }) => {
  const location = useLocation();
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  console.log("RequireAuth check:", JSON.stringify({ userRole, token, requiredRole: role, location: location.pathname }, null, 2));

  if (!token || !userRole || userRole !== role) {
    return <Navigate to="/auth/login" state={{ from: location, intendedRole: role }} replace />;
  }
  return children;
};

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<UserSelection />} />
        <Route path="/auth/:role" element={<AuthForm />} />
        <Route
          path="/seller-dashboard"
          element={
            <RequireAuth role="seller">
              <SellerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/seller-dashboard/active"
          element={
            <RequireAuth role="seller">
              <ActiveAuctions />
            </RequireAuth>
          }
        />
        <Route
          path="/seller-dashboard/scheduled"
          element={
            <RequireAuth role="seller">
              <ScheduledAuctions />
            </RequireAuth>
          }
        />
        <Route
          path="/seller-dashboard/completed"
          element={
            <RequireAuth role="seller">
              <CompletedAuctions />
            </RequireAuth>
          }
        />
        <Route path="/chat/:auctionId/:recipientId" element={<Chat />} />
        <Route
          path="/seller-dashboard/live-auction/:auctionId"
          element={
            <RequireAuth role="seller">
              <LiveAuctionDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/create-auction"
          element={
            <RequireAuth role="seller">
              <CreateAuction />
            </RequireAuth>
          }
        />
        <Route
          path="/bidder-dashboard"
          element={
            <RequireAuth role="bidder">
              <BidderDashboard />
            </RequireAuth>
          }
        >
          <Route path="auctions" element={<BidderAuctionList />} />
          <Route path="auction/:id" element={<BidDetails />} /> {/* Render BidDetails as a nested route */}
          <Route path="history" element={<BidHistory />} />
        </Route>
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auction/:id" element={<AuctionDetails />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;