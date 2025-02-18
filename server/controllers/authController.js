const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// Register a new user
exports.register = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      //create new user
        //first sequire the password, it is a async process => try catch block will be used
        let hashedPassword;
        try{
            //hash is the method in the bcrypt library, 10 means level of hashing
            hashedPassword= await bcrypt.hash(password, 10);
        }
        catch(err){
            return res.status(500).json({
                success:false,
                message:"Error in hashing"
            });
        }

        
      // Create a new user
      const user = await User.create({ name, email, password:hashedPassword, role });
      

      
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };

  // Login a user
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
      );

      //option for cookie
      const options = {
        expires: new Date( Date.now() + 3*24*60*60*1000),
        httpOnly: true,
    };

    const userObj ={
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    res.setHeader("Authorization", `Bearer ${token}`);
    res.cookie("token", token, options).status(200).json({ token,userObj, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  

  // Get all users - Only accessible to admins
exports.getallUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select('-password'); // Exclude password from the response

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};