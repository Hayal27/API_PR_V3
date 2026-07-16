// verfiyToken.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Extract token from "Bearer token"
  
  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  // Verify the token and extract user data
  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Failed to authenticate token" });
    }

    // Attach user information to the request object (e.g., user_id)
    req.user_id = decoded.user_id;  // Make sure the token contains user_id in its payload
    next();  // Pass control to the next middleware or route handler
  });
};

module.exports = verifyToken;
