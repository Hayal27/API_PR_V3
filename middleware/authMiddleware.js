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
    req.user_id = decoded.user_id;
    const roleId = Number(decoded.role_id) || 0;
    const roleName = String(decoded.role_name || '').toLowerCase();
    req.role_id = roleId;
    req.branch_id = decoded.branch_id || 1;
    req.role_name = decoded.role_name || '';
    req.is_super_admin = (roleId === 34 || roleId === 1 || roleName.includes('super admin') || roleName === 'admin' || Boolean(decoded.is_super_admin));
    req.is_branch_admin = (roleId === 35 || roleName === 'branch admin' || Boolean(decoded.is_branch_admin));
    req.is_central_top2 = (
      [29, 2].includes(roleId) ||
      roleName.includes('ceo') ||
      roleName.includes('deputy ceo') ||
      [9, 10].includes(Number(decoded.org_node_id)) ||
      (Number(decoded.branch_id) === 1 && Number(decoded.org_level) > 0 && Number(decoded.org_level) <= 2) ||
      Boolean(decoded.is_central_top2)
    );
    req.can_see_all_branches = req.is_super_admin || req.is_central_top2 || Boolean(decoded.can_see_all_branches || decoded.can_view_all_branches);
    req.allowed_branches = decoded.assigned_branch_ids && Array.isArray(decoded.assigned_branch_ids) 
      ? decoded.assigned_branch_ids 
      : [Number(decoded.branch_id) || 1];
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
