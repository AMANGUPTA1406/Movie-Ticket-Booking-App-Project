const Movie = require("../models/Movie");
const Theater = require("../models/Theater");

// Add a new movie (Admin only)
exports.addMovie = async (req, res) => {
    try {
      const { title, genre, duration, language } = req.body;
  
      // Create a new movie
      const newMovie = new Movie({ title, genre, duration, language });
      await newMovie.save();
  
      res.status(201).json({ message: "Movie added successfully", movie: newMovie });
    } catch (error) {
      res.status(500).json({ message: "Failed to add movie", error });
    }
  };

  // Get all movies
exports.getMovies = async (req, res) => {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve movies", error });
    }
  };

  // Get a movie by ID
exports.getMovieById = async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.status(200).json(movie);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve movie", error });
    }
  };


// Search movies by title and return theaters and showtimes
exports.searchByTitle = async (req, res) => {
  try {
    // console.log("csdcsdc");
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    // console.log(title);
    // Find movies that match the title
    const movies = await Movie.find({ title: { $regex: title, $options: "i" } });

    if (!movies.length) {
      return res.status(404).json({ message: "No movies found" });
    }

    // Collect movie IDs
    const movieIds = movies.map((movie) => movie._id);

    // Find theaters that have these movies
    const theaters = await Theater.find({
      "screens.showtimes.movie": { $in: movieIds },
    });

    // Map the movies to their corresponding theaters and showtimes
    const result = movies.map((movie) => {
      const movieTheaters = theaters.map((theater) => {
        const showtimes = [];
        theater.screens.forEach((screen) => {
          screen.showtimes.forEach((showtime) => {
            if (String(showtime.movie) === String(movie._id)) {
              showtimes.push({
                screenName: screen.name,
                time: showtime.time,
              });
            }
          });
        });
        return { theaterName: theater.name, location: theater.location, showtimes };
      });
      return { movie, theaters: movieTheaters };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to search movies by title", error });
  }
};

// Search movies by location and return theaters and showtimes
exports.searchByLocation = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Find theaters that match the location
    const theaters = await Theater.find({
      location: { $regex: location, $options: "i" },
    }).populate("screens.showtimes.movie");

    // Collect unique movie IDs from theaters
    const movieSet = new Set();
    theaters.forEach((theater) =>
      theater.screens.forEach((screen) =>
        screen.showtimes.forEach((showtime) => movieSet.add(showtime.movie._id))
      )
    );

    // Find movies that are showing in these theaters
    const movies = await Movie.find({ _id: { $in: Array.from(movieSet) } });

    // Map the movies to their corresponding theaters and showtimes
    const result = movies.map((movie) => {
      const movieTheaters = theaters.map((theater) => {
        const showtimes = [];
        theater.screens.forEach((screen) => {
          screen.showtimes.forEach((showtime) => {
            if (String(showtime.movie._id) === String(movie._id)) {
              showtimes.push({
                screenName: screen.name,
                time: showtime.time,
              });
            }
          });
        });
        return { theaterName: theater.name, location: theater.location, showtimes };
      });
      return { movie, theaters: movieTheaters };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to search movies by location", error });
  }
};

// Search movies by showtime and return theaters and showtimes
exports.searchByShowtime = async (req, res) => {
  try {
    const { time } = req.body;
    if (!time) {
      return res.status(400).json({ message: "Showtime is required" });
    }

    // Find theaters that have showtimes matching the provided time
    const theaters = await Theater.find({
      "screens.showtimes.time": new Date(time),
    }).populate("screens.showtimes.movie");

    // Collect unique movie IDs from the showtimes
    const movieSet = new Set();
    theaters.forEach((theater) =>
      theater.screens.forEach((screen) =>
        screen.showtimes.forEach((showtime) => movieSet.add(showtime.movie._id))
      )
    );

    // Find movies that are showing at the provided showtime
    const movies = await Movie.find({ _id: { $in: Array.from(movieSet) } });

    // Map the movies to their corresponding theaters and showtimes
    const result = movies.map((movie) => {
      const movieTheaters = theaters.map((theater) => {
        const showtimes = [];
        theater.screens.forEach((screen) => {
          screen.showtimes.forEach((showtime) => {
            if (
              String(showtime.movie._id) === String(movie._id) &&
              new Date(showtime.time).getTime() === new Date(time).getTime()
            ) {
              showtimes.push({
                screenName: screen.name,
                time: showtime.time,
              });
            }
          });
        });
        return { theaterName: theater.name, location: theater.location, showtimes };
      });
      return { movie, theaters: movieTheaters };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to search movies by showtime", error });
  }
};


exports.searchMovieByTheater = async (req, res) => {
  const { theaterId } = req.body;

  if (!theaterId) {
    return res.status(400).json({ error: 'Theater ID is required' });
  }

  try {
    // Find the theater by its ID and populate movie details
    const theater = await Theater.findById(theaterId).populate('screens.showtimes.movie');

    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }

    // Extract all movies from the showtimes
    const movies = new Set();
    theater.screens.forEach(screen => {
      screen.showtimes.forEach(showtime => {
        if (showtime.movie) {
          movies.add(JSON.stringify(showtime.movie)); // Add movie as a string to avoid duplicates
        }
      });
    });

    // Convert set to an array of movie objects
    const uniqueMovies = Array.from(movies).map(movie => JSON.parse(movie));

    return res.status(200).json({ movies: uniqueMovies });
  } catch (error) {
    console.error('Error fetching movies by theater:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.searchScreenAndShowTime = async (req, res) => {
  const { theaterId, movieId } = req.body;

  // Validate request body
  if (!theaterId || !movieId) {
    return res.status(400).json({ error: 'Theater ID and Movie ID are required' });
  }

  try {
    // Find the theater by its ID
    const theater = await Theater.findById(theaterId);

    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }

    // Filter screens and showtimes for the provided movie ID
    const screensWithShowtimes = theater.screens.map((screen) => {
      const filteredShowtimes = screen.showtimes.filter(
        (showtime) => String(showtime.movie) === String(movieId)
      );

      // Only include screens that have showtimes for the given movie
      if (filteredShowtimes.length > 0) {
        return {
          screenName: screen.name,
          showtimes: filteredShowtimes.map((showtime) => ({
            showId: showtime._id,  // Include showId in the response
            time: showtime.time,
            seatCategories: showtime.seatCategories,
            bookedSeats: showtime.booked,
          })),
        };
      }
    }).filter(Boolean); // Remove undefined entries for screens without showtimes

    if (screensWithShowtimes.length === 0) {
      return res.status(404).json({ message: 'No screens or showtimes found for the given movie' });
    }

    // Respond with the filtered screens and showtimes
    res.status(200).json({ theaterName: theater.name, screens: screensWithShowtimes });
  } catch (error) {
    console.error('Error fetching screens and showtimes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to edit movie details by ID
exports.editMovie = async (req, res) => {
  const { movieId, title, genre, duration, language, theaters } = req.body;

  if (!movieId) {
    return res.status(400).json({ error: 'Movie ID is required' });
  }

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { title, genre, duration, language, theaters },
      { new: true, runValidators: true } // Returns updated movie and applies validation
    );

    if (!updatedMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to delete movie by ID
exports.deleteMovie = async (req, res) => {
  const { movieId } = req.body;
  if (!movieId) {
    return res.status(400).json({ error: 'Movie ID is required' });
  }

  try {
    const movie = await Movie.findByIdAndDelete(movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


