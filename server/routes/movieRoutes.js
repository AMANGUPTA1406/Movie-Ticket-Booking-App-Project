const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {addMovie, getMovies, getMovieById, 
    searchByTitle, searchByLocation, searchByShowtime,searchMovieByTheater,searchScreenAndShowTime,
    addTheater, addShowtime,deleteMovie, editMovie, 
} = require("../controllers/movieController");

// Add a new movie (Admin only)
router.post("/add", isAuthenticated, isAdmin, addMovie);

// Get all movies
router.post("/getall", getMovies);

// Get a movie by ID
router.post("/movies/:id", getMovieById);

// Search movies by title
router.post("/search/title", searchByTitle);

// Search movies by location
router.post("/search/location", searchByLocation);

// Search movies by showtime
router.post("/search/showtime", searchByShowtime);

//get all movies on that theaters using theater id
router.post("/search/movieByTheater", isAuthenticated, searchMovieByTheater);

//get all the screens and showtimes of a theater and movie
router.post("/search/screenAndShowTime", isAuthenticated, searchScreenAndShowTime);

//delete the movie by id
router.post("/delete", isAuthenticated, isAdmin, deleteMovie);

// edit movie by id
router.post("/edit", isAuthenticated, isAdmin, editMovie);

module.exports = router;
