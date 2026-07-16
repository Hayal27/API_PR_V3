const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");
const { verifyToken } = require("../middleware/authMiddleware");

// Change password (authenticated user)
router.put("/change-password", verifyToken, passwordController.changePassword);

// Request password reset OTP (forgot password)
router.post("/forgot-password", passwordController.requestPasswordReset);

// Verify OTP
router.post("/verify-otp", passwordController.verifyOTP);

// Reset password with OTP
router.post("/reset-password", passwordController.resetPasswordWithOTP);

// Resend OTP
router.post("/resend-otp", passwordController.resendOTP);

module.exports = router;
