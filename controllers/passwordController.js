const con = require("../models/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Initialize email transporter
let transporter;

const initializeTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = initializeTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "🔐 Password Reset OTP - ITPCR System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(100deg, rgb(22, 40, 79) 2%, rgb(12, 124, 146) 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Password Reset Request</h1>
          </div>
          
          <div style="background: #f5f7fb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password for your ITPCR account. 
              Use the OTP code below to proceed with password reset:
            </p>
            
            <div style="background: white; border: 2px solid #64b5f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">Your OTP Code:</p>
              <h2 style="color: #0084ff; font-size: 36px; letter-spacing: 5px; margin: 0; font-weight: bold;">${otp}</h2>
            </div>
            
            <p style="color: #ff6b9d; font-size: 13px; font-weight: bold;">
              ⏰ This OTP will expire in 15 minutes
            </p>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              <strong>Security Tips:</strong>
            </p>
            <ul style="color: #555; font-size: 14px; line-height: 1.8;">
              <li>Never share this OTP with anyone</li>
              <li>EITPR staff will never ask for your OTP</li>
              <li>If you didn't request this, ignore this email</li>
            </ul>
            
            <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2026ITPCR System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};

// 1. Change Password (Authenticated User)
exports.changePassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain uppercase, lowercase, number, and special character"
      });
    }

    // Get current user
    const query = "SELECT password FROM users WHERE user_id = ?";
    con.query(query, [user_id], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, results[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const updateQuery = "UPDATE users SET password = ?, password_changed_at = NOW(), last_password_change = NOW() WHERE user_id = ?";
      con.query(updateQuery, [hashedPassword, user_id], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update password"
          });
        }

        return res.status(200).json({
          success: true,
          message: "✅ Password changed successfully"
        });
      });
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// 2. Request Password Reset OTP (Forgot Password)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user by email - must exist in employees table
    const query = `
      SELECT u.user_id, u.user_name, u.password, e.email 
      FROM users u 
      INNER JOIN employees e ON u.employee_id = e.employee_id 
      WHERE e.email = ? OR u.user_name = ?
    `;

    con.query(query, [email, email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length === 0) {
        // User not found in employees table
        return res.status(401).json({
          success: false,
          message: "❌ You are not one of the users of this system"
        });
      }

      const user = results[0];
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save OTP to database
      const insertQuery = `
        INSERT INTO password_reset_otp (user_id, email, otp_code, expires_at)
        VALUES (?, ?, ?, ?)
      `;

      con.query(insertQuery, [user.user_id, email, otp, expiresAt], async (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to generate OTP"
          });
        }

        // Send OTP email
        try {
          await sendOTPEmail(email, otp, user.user_name);
          return res.status(200).json({
            success: true,
            message: "✅ OTP sent to your email",
            data: {
              email: email,
              maskedEmail: email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
            }
          });
        } catch (emailError) {
          console.error("Email error:", emailError);
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP email"
          });
        }
      });
    });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// 3. Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find OTP record
    const query = `
      SELECT * FROM password_reset_otp 
      WHERE email = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW()
    `;

    con.query(query, [email, otp], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length === 0) {
        // Increment attempts
        const updateQuery = "UPDATE password_reset_otp SET attempts = attempts + 1 WHERE email = ? AND otp_code = ?";
        con.query(updateQuery, [email, otp], () => {});

        return res.status(401).json({
          success: false,
          message: "Invalid or expired OTP"
        });
      }

      const otpRecord = results[0];

      // Check attempts
      if (otpRecord.attempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP"
        });
      }

      // Mark OTP as verified
      const verifyQuery = "UPDATE password_reset_otp SET verified_at = NOW() WHERE otp_id = ?";
      con.query(verifyQuery, [otpRecord.otp_id], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
          });
        }

        return res.status(200).json({
          success: true,
          message: "✅ OTP verified successfully",
          data: {
            otpId: otpRecord.otp_id,
            userId: otpRecord.user_id,
            email: email
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// 4. Reset Password with OTP
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain uppercase, lowercase, number, and special character"
      });
    }

    // Find verified OTP
    const query = `
      SELECT * FROM password_reset_otp 
      WHERE email = ? AND otp_code = ? AND verified_at IS NOT NULL AND is_used = 0
    `;

    con.query(query, [email, otp], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid OTP or OTP not verified"
        });
      }

      const otpRecord = results[0];

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      const updateUserQuery = "UPDATE users SET password = ?, password_changed_at = NOW(), last_password_change = NOW() WHERE user_id = ?";
      con.query(updateUserQuery, [hashedPassword, otpRecord.user_id], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to reset password"
          });
        }

        // Mark OTP as used
        const markUsedQuery = "UPDATE password_reset_otp SET is_used = 1 WHERE otp_id = ?";
        con.query(markUsedQuery, [otpRecord.otp_id], (err) => {
          if (err) {
            console.error("Database error:", err);
          }
        });

        return res.status(200).json({
          success: true,
          message: "✅ Password reset successfully. You can now login with your new password"
        });
      });
    });
  } catch (error) {
    console.error("Error in resetPasswordWithOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// 5. Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user - must exist in employees table
    const userQuery = `
      SELECT u.user_id, u.user_name, e.email 
      FROM users u 
      INNER JOIN employees e ON u.employee_id = e.employee_id 
      WHERE e.email = ? OR u.user_name = ?
    `;

    con.query(userQuery, [email, email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "❌ You are not one of the users of this system"
        });
      }

      const user = results[0];
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Insert new OTP
      const insertQuery = `
        INSERT INTO password_reset_otp (user_id, email, otp_code, expires_at)
        VALUES (?, ?, ?, ?)
      `;

      con.query(insertQuery, [user.user_id, email, otp, expiresAt], async (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to generate OTP"
          });
        }

        try {
          await sendOTPEmail(email, otp, user.user_name);
          return res.status(200).json({
            success: true,
            message: "✅ New OTP sent to your email"
          });
        } catch (emailError) {
          console.error("Email error:", emailError);
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP email"
          });
        }
      });
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
