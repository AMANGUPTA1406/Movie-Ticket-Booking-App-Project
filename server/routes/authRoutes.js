const express = require("express");
const router = express.Router();
const { register, login, getallUsers } = require("../controllers/authController");
const { route } = require("./movieRoutes");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);

//get all the users 
router.post("/getall",isAuthenticated,isAdmin, getallUsers);

module.exports = router;
