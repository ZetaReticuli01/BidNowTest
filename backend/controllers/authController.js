// const bcrypt = require("bcryptjs");
// const User = require("../models/User");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         if (!name || !email || !password || !role) {
//             return res.status(400).json({ error: "All fields are necessary" });
//         }

//         if (!["seller", "bidder", "guest"].includes(role)) {
//             return res.status(400).json({ error: "Invalid role selected" });
//         }

//         const existingEmail = await User.findOne({ email });
//         if (existingEmail) {
//             return res.status(400).json({ error: "Email already exists" });
//         }

//         const hashPassword = await bcrypt.hash(password, 10);

//         const user = new User({
//             name,
//             email,
//             password: hashPassword,
//             role // Store selected role in the database
//         });

//         const data = await user.save();

//         res.status(201).json({
//             _id: data._id,
//             name: data.name,
//             email: data.email,
//             role: data.role,  // Send back role to frontend
//             wallet: data.wallet,
//             createdAt: data.createdAt
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(400).json({ error: "Please enter email and password" });
//         }

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(400).json({ error: "Incorrect password" });
//         }

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             process.env.JWT_SECRET_KEY,
//             { expiresIn: process.env.JWT_EXPIRY }
//         );

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "Strict",
//             maxAge: 24 * 60 * 60 * 1000
//         });

//         res.status(200).json({
//             message: "Login successful",
//             userId: user._id,
//             role: user.role,  // Send role back to frontend for navigation
//             token
//         });
//     } catch (err) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// };
















const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
    }

    if (!["seller", "bidder", "guest"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'seller', 'bidder', or 'guest'" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashPassword,
      role, // Store selected role in the database
    });

    const data = await user.save();

    res.status(201).json({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role, // Send back role to frontend
      wallet: data.wallet,
      createdAt: data.createdAt,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY || "1h" } // Default to 1 hour if JWT_EXPIRY not set
    );

    // Set HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return token and user data in response for frontend to store in localStorage
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      role: user.role, // Ensure role is sent back
      token, // Include token in response for localStorage
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};