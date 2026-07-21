// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const { getLogin, logout } = require("../models/LoginModel");

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "hayaltamrat@27");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

const authMiddleware = {
  login: (req, res, next) => getLogin(req, res, next),
  logout: (req, res, next) => logout(req, res, next),
  verifyToken
};

module.exports = authMiddleware;
