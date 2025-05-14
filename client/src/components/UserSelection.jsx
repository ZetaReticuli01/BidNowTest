// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/UserSelection.css";

// const UserSelection = () => {
//   const [role, setRole] = useState("seller");
//   const navigate = useNavigate();

//   const handleProceed = () => {
//     navigate(`/auth/${role}`); // Redirect to Login/Signup based on role
//   };

//   return (
//     <div className="user-selection">
//       <div className="selection-box">
//         <div className="logo">BIDNOW</div>
//         <h2>Join As</h2>
//         <div className="role-options">
//           <div className="role-item">
//             <label>
//               <input type="radio" name="role" value="seller" checked={role === "seller"} onChange={() => setRole("seller")} />
//               Seller
//             </label>
//           </div>
//           <div className="role-item">
//             <label>
//               <input type="radio" name="role" value="bidder" checked={role === "bidder"} onChange={() => setRole("bidder")} />
//               Bidder
//             </label>
//           </div>
//           <div className="role-item">
//             <label>
//               <input type="radio" name="role" value="guest" checked={role === "guest"} onChange={() => setRole("guest")} />
//               Guest User
//             </label>
//           </div>
//         </div>
//         <button className="next-button" onClick={handleProceed}>PROCEED</button>
//       </div>
//     </div>
//   );
// };

// export default UserSelection;















import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UserSelection.css";

const UserSelection = () => {
  const [role, setRole] = useState("seller");
  const navigate = useNavigate();

  const handleProceed = () => {
    if (role === "guest") {
      navigate("/auctions"); // Direct guest to public auction list
    } else {
      navigate(`/auth/login?role=${role}`); // Redirect to login with role
    }
  };

  return (
    <div className="user-selection">
      <div className="selection-box">
        <div className="logo">BIDNOW</div>
        <h2>Join As</h2>
        <div className="role-options">
          <div className="role-item">
            <label>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
              />
              Seller
            </label>
          </div>
            <div className="role-item">&nbsp;&nbsp;
            <label>
              <input
                type="radio"
                name="role"
                value="bidder"
                checked={role === "bidder"}
                onChange={() => setRole("bidder")}
              />
              Bidder
            </label>
          </div>
          {/* <div className="role-item">
            <label>
              <input
                type="radio"
                name="role"
                value="guest"
                checked={role === "guest"}
                onChange={() => setRole("guest")}
              />
              Guest User
            </label>
          </div> */}
        </div>
        <button className="next-button" onClick={handleProceed}>
          PROCEED
        </button>
      </div>
    </div>
  );
};

export default UserSelection;