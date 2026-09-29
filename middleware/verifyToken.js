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

    // Attach user information to the request object
    req.user = decoded;
    req.user_id = decoded.user_id;
    req.role_id = decoded.role_id;
    req.branch_id = decoded.branch_id || 1;
    req.role_name = decoded.role_name || '';
    req.is_super_admin = (Number(decoded.role_id) === 34 || Number(decoded.role_id) === 1 || String(decoded.role_name || '').toLowerCase().includes('super admin') || String(decoded.role_name || '').toLowerCase() === 'admin' || Boolean(decoded.is_super_admin));
    req.is_branch_admin = (Number(decoded.role_id) === 35 || String(decoded.role_name || '').toLowerCase() === 'branch admin');
    req.is_central_top2 = ([29, 2].includes(Number(decoded.role_id)) || String(decoded.role_name || '').toLowerCase().includes('ceo') || String(decoded.role_name || '').toLowerCase().includes('deputy ceo'));
    req.can_see_all_branches = req.is_super_admin || req.is_central_top2 || Boolean(decoded.can_view_all_branches);
    req.allowed_branches = decoded.assigned_branch_ids && Array.isArray(decoded.assigned_branch_ids) 
      ? decoded.assigned_branch_ids 
      : [Number(decoded.branch_id) || 1];
    next();  // Pass control to the next middleware or route handler
  });
};

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    req.user = null;
    req.branch_id = 1;
    req.allowed_branches = [1];
    req.is_super_admin = false;
    req.is_branch_admin = false;
    req.is_central_top2 = false;
    req.can_see_all_branches = false;
    return next();
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
      req.user_id = decoded.user_id;
      req.role_id = decoded.role_id;
      req.branch_id = decoded.branch_id || 1;
      req.role_name = decoded.role_name || '';
      req.is_super_admin = (Number(decoded.role_id) === 34 || Number(decoded.role_id) === 1 || String(decoded.role_name || '').toLowerCase().includes('super admin') || String(decoded.role_name || '').toLowerCase() === 'admin' || Boolean(decoded.is_super_admin));
      req.is_branch_admin = (Number(decoded.role_id) === 35 || String(decoded.role_name || '').toLowerCase() === 'branch admin');
      req.is_central_top2 = ([29, 2].includes(Number(decoded.role_id)) || String(decoded.role_name || '').toLowerCase().includes('ceo') || String(decoded.role_name || '').toLowerCase().includes('deputy ceo'));
      req.can_see_all_branches = req.is_super_admin || req.is_central_top2 || Boolean(decoded.can_view_all_branches);
      req.allowed_branches = decoded.assigned_branch_ids && Array.isArray(decoded.assigned_branch_ids) 
        ? decoded.assigned_branch_ids 
        : [Number(decoded.branch_id) || 1];
    }
    next();
  });
};

verifyToken.optionalVerifyToken = optionalVerifyToken;
verifyToken.verifyToken = verifyToken;

module.exports = verifyToken;

