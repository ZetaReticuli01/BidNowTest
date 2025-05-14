import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreateAuction.css";

const CreateAuction = () => {
  const navigate = useNavigate();
  const [auctionData, setAuctionData] = useState({
    title: "",
    desc: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
    certifyingAuthority: "",
    certificateNumber: "",
    isReplica: false,
    isVerified: false, // Changed from verified to isVerified
  });
  const [certificate, setCertificate] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key);
    }
    console.log("LocalStorage contents:", storage);

    const token = localStorage.getItem("token");
    console.log("Auth check on mount:", { token });

    if (!token) {
      setError("No token found. Please log in.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAuctionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.name === "certificate") {
      setCertificate(e.target.files[0]);
      setAuctionData((prev) => ({
        ...prev,
        isVerified: !!e.target.files[0], // Changed to isVerified
      }));
    } else if (e.target.name === "productImages") {
      setProductImages(e.target.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    console.log("Submitting with:", { token, auctionData });

    if (!token) {
      setError("Cannot submit: Missing token. Please log in again.");
      setLoading(false);
      return;
    }

    const now = new Date();
    const startTime = new Date(auctionData.startTime);
    const endTime = new Date(auctionData.endTime);

    if (startTime < now) {
      setError("Start time cannot be in the past.");
      setLoading(false);
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    // Certificate is required only if isReplica is false
    if (!auctionData.isReplica && !certificate) {
      setError("Please upload a certificate.");
      setLoading(false);
      return;
    }
    if (productImages.length === 0) {
      setError("Please upload at least one product image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", auctionData.title);
    formData.append("desc", auctionData.desc);
    formData.append("startingPrice", auctionData.startingPrice);
    formData.append("currentPrice", auctionData.startingPrice);
    formData.append("startTime", auctionData.startTime);
    formData.append("endTime", auctionData.endTime);
    formData.append("certifyingAuthority", auctionData.certifyingAuthority);
    formData.append("certificateNumber", auctionData.certificateNumber);
    formData.append("isReplica", auctionData.isReplica);
    formData.append("isVerified", auctionData.isReplica ? false : !!certificate); // Changed to isVerified
    if (certificate) {
      formData.append("certificate", certificate);
    }
    Array.from(productImages).forEach((file) => {
      formData.append("productImages", file);
    });

    for (let [key, value] of formData.entries()) {
      console.log(`FormData: ${key}=${value}`);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auction`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      alert("Auction created successfully!");
      navigate("/seller-dashboard", { replace: true });
    } catch (error) {
      setLoading(false);
      console.error("Error creating auction:", error.response || error);
      const errorMessage =
        error.response?.data?.error || "Failed to create auction.";
      setError(errorMessage);
    }
  };

  return (
    <div className="create-auction-container">
      <h2>Create New Auction</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Auction Title"
          value={auctionData.title}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <textarea
          name="desc"
          placeholder="Auction Description"
          value={auctionData.desc}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="number"
          name="startingPrice"
          placeholder="Starting Price"
          value={auctionData.startingPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          disabled={loading}
        />
        <input
          type="datetime-local"
          name="startTime"
          value={auctionData.startTime}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="datetime-local"
          name="endTime"
          value={auctionData.endTime}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="certifyingAuthority"
          placeholder="Certifying Authority"
          value={auctionData.certifyingAuthority}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="certificateNumber"
          placeholder="Certificate Number"
          value={auctionData.certificateNumber}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <div>
          <label>
            Is Replica:
            <input
              type="checkbox"
              name="isReplica"
              checked={auctionData.isReplica}
              onChange={handleChange}
              disabled={loading}
            />
          </label>
        </div>
        {!auctionData.isReplica && (
          <div>
            <label htmlFor="certificate">Upload Certificate (PDF or Image):</label>
            <input
              type="file"
              name="certificate"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              required={!auctionData.isReplica}
              disabled={loading}
            />
          </div>
        )}
        <div>
          <label htmlFor="productImages">Upload Product Images:</label>
          <input
            type="file"
            name="productImages"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            required
            disabled={loading}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Auction"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/seller-dashboard")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;