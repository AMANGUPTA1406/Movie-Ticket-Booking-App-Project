const Movie = require("../models/Movie");
const Theater = require("../models/Theater");


exports.createTheater = async (req, res) => {
    try {
      const { name, location } = req.body;
      const newTheater = new Theater({ name, location });
      await newTheater.save();
      res.status(201).json({ message: "Theater created successfully", theater: newTheater });
    } catch (error) {
      res.status(500).json({ message: "Failed to create theater", error });
    }
  };
  
// Add a new screen to an existing theater
exports.addScreen = async (req, res) => {
  try {
    const { theaterId, screen } = req.body;

    // Validate screen data
    if (!screen || !screen.name) {
      return res.status(400).json({ message: "Screen name is required" });
    }

    // Find the theater by ID
    const theater = await Theater.findById(theaterId);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    // Add the new screen to the theater
    theater.screens.push({
      name: screen.name,
      seats: screen.seats,
      showtimes: screen.showtimes || [],
    });

    // Save the updated theater
    await theater.save();

    res.status(201).json({ message: "Screen added successfully", theater });
  } catch (error) {
    res.status(500).json({ message: "Failed to add screen", error });
  }
};


// Add a new showtime to a theater
exports.addShowtime = async (req, res) => {
    try {
      const { theaterId, screenName, movieId, time, seatCategories } = req.body;
  
      // Verify movie
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
  
      // Create the new showtime object
      const newShowtime = { movie: movieId, time, seatCategories };
  
      // Update the screen in the theater
      const theater = await Theater.findOneAndUpdate(
        { _id: theaterId, "screens.name": screenName },
        { $push: { "screens.$.showtimes": newShowtime } }, // `$` targets the matched screen
        { new: true } // Return the updated document
      );
  
      if (!theater) {
        return res.status(404).json({ message: "Theater or screen not found" });
      }
  
      res.status(201).json({ message: "Showtime added successfully", showtime: newShowtime });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to add showtime", error });
    }
  };
  

  // Get all theaters
exports.getTheaters = async (req, res) => {
    try {
      const theaters = await Theater.find();
      res.status(200).json(theaters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theaters", error });
    }
  };

  // Get a theater by ID
exports.getTheaterById = async (req, res) => {
    try {
      const { id } = req.params || req.body;
      const theater = await Theater.findById(id);
      if (!theater) {
        return res.status(404).json({ message: "Theater not found" });
      }
      res.status(200).json(theater);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch theater", error });
    }
  };


  // Search theaters by location
exports.searchByLocation = async (req, res) => {
    try {
      const { location } = req.body;
      const theaters = await Theater.find({ location: new RegExp(location, "i") });
      res.status(200).json(theaters);
    } catch (error) {
      res.status(500).json({ message: "Failed to search theaters by location", error });
    }
  };


  exports.deleteTheater = async (req, res) => {
    try{
      const { TheaterId } = req.body;
      if(!TheaterId){
        return res.status(400).json({ message: "TheaterId is required" });
      }

      await Theater.findByIdAndDelete(TheaterId);
      res.status(200).json({ message: "Theater deleted successfully" });
    }
    catch(err){
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


exports.editTheater = async (req, res) => {
  try {
    const theaterId = req.body.theaterId; // The ID of the theater to edit
    const { name, location, screens } = req.body; // Extract new details

    // Find the theater by ID
    const theater = await Theater.findById(theaterId);

    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    // Update the theater details
    if (name) theater.name = name;
    if (location) theater.location = location;

    // Add screens to the theater if provided
    if (screens && Array.isArray(screens)) {
      screens.forEach((screen) => {
        const { screenName, seats, showtimes } = screen;

        // Add the new screen to the theater's screens array
        const newScreen = {
          name: screenName,
          seats: seats || 100, // Default to 100 if not provided
          showtimes: [],
        };

        // Add showtimes to the screen if provided
        if (showtimes && Array.isArray(showtimes)) {
          showtimes.forEach((showtime) => {
            const { movieId, time, seatCategories } = showtime;

            const newShowtime = {
              movie: movieId,
              time: time,
              seatCategories: seatCategories || [],
              booked: [],
            };

            // Add the showtime to the screen
            newScreen.showtimes.push(newShowtime);
          });
        }

        // Add the screen to the theater
        theater.screens.push(newScreen);
      });
    }

    // Save the updated theater
    await theater.save();

    res.status(200).json({ message: "Theater updated successfully", theater });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error editing theater", error });
  }
};
