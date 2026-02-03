import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import "../styles/Chat.css";

const Chat = () => {
  const { auctionId, recipientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatTitle, setChatTitle] = useState("Chat");
  const messagesEndRef = useRef(null);

  // Initialize WebSocket once
  useEffect(() => {
    const socketIo = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("token") },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Handle WebSocket events and fetch messages
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Connected to WebSocket server, socket ID:", socket.id);
    };

    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      if (message.auction.toString() === auctionId) {
        setMessages((prev) => {
          // Prevent duplicates by checking message ID
          if (prev.some((msg) => msg._id === message._id)) {
            console.log("Duplicate message ignored:", message._id);
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    const handleConnectError = (err) => {
      console.error("WebSocket connection error:", err.message);
      setError("Failed to connect to chat server.");
    };

    socket.on("connect", handleConnect);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("connect_error", handleConnectError);

    fetchMessages();

    return () => {
      console.log("Cleaning up WebSocket listeners for auction:", auctionId);
      socket.off("connect", handleConnect);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, auctionId]);

  // Fetch chat messages and determine chat title
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access the chat.");
        setLoading(false);
        return;
      }

      // Fetch auction details to determine recipient's name
      const auctionResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const auction = auctionResponse.data;
      const userRole = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");

      if (userRole === "seller") {
        setChatTitle(`Chat with ${auction.highestBidder?.name || "Bidder"}`);
      } else {
        setChatTitle(`Chat with ${auction.seller?.name || "Seller"}`);
      }

      // Fetch messages
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched messages:", response.data.messages);
      setMessages(response.data.messages || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessages([]);
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to access this chat.");
      } else {
        setError("Failed to load messages. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const senderId = localStorage.getItem("userId");
      if (!token || !senderId) {
        setError("Please log in to send messages.");
        return;
      }

      const messageData = {
        auction: auctionId,
        sender: senderId,
        message: newMessage,
      };

      // Send message via HTTP
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/send`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Message sent via HTTP:", response.data);

      // Emit message via WebSocket
      socket.emit("sendMessage", { data: { auction: auctionId, message: newMessage } });

      setNewMessage("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You are not authorized to send messages in this chat.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    }
  };

  if (loading) return <p className="chat-loading">Loading chat...</p>;
  if (error) return <p className="chat-error">{error}</p>;

  return (
    <div className="chat-container">
      <h2 className="chat-title">{chatTitle}</h2>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`chat-message ${msg.sender._id === localStorage.getItem("userId") ? "sent" : "received"}`}
            >
              <p>
                <strong>{msg.sender.name}:</strong> {msg.message}
              </p>
              <span className="chat-timestamp">
                {new Date(msg.timeStamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Send
        </button>
      </div>
      <button onClick={() => navigate(-1)} className="chat-back-button">
        Back
      </button>
    </div>
  );
};

export default Chat;