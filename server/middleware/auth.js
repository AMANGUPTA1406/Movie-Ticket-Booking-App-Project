const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if the user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  
  try {
    const token =  req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

    // If no token is found
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET ); 
    if(!decoded){
      return res.status(401).json({ message: "Invalid token. Access denied." });
    }
    req.user = {
      id: decoded.id,
      role: decoded.role,
    }
    // req.user.role = decoded.role;
    next(); 
  } catch (error) {
    res.status(401).json({ message: "Invalid token. Access denied.", error });
  }
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
