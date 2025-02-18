const express = require('express');
const router = express.Router();
const {createTheater, getTheaters, getTheaterById, 
    searchByLocation,
    addScreen, addShowtime, deleteTheater, editTheater
} = require("../controllers/theaterController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");


// Add a new theater (Admin only)
router.post("/add", isAuthenticated, isAdmin, createTheater);

//add a new screen  (Admin only)
router.post("/addScreen", isAuthenticated, isAdmin, addScreen);

// to add Showtime
router.post("/addShowtime", isAuthenticated, isAdmin, addShowtime);

// Get all theaters 
router.get("/getall", getTheaters);

// Get a theater by ID  
router.get("/theaters/:id", getTheaterById);

// Search theaters by location
router.post("/search/TheaterBylocation", searchByLocation);

//delete a theater by id
router.post("/delete", isAuthenticated, isAdmin, deleteTheater);

//edit theater all the details and add screens and showtimes
router.post("/edit", isAuthenticated, isAdmin, editTheater);

module.exports = router;