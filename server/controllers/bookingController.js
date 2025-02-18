const Booking = require("../models/Booking");
const Theater = require("../models/Theater");
const User = require("../models/User");
const Movie = require("../models/Movie");

exports.createBooking = async (req, res) => {
  try {
    const { userId, theaterId, showtimeId, seats } = req.body;

    // Find the theater and populate necessary fields
    const theater = await Theater.findById(theaterId).populate("screens.showtimes.movie");
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    // Find the showtime across all screens
    let showtime;
    let screenName;
    let screen;
    for (let sc of theater.screens) {
      showtime = sc.showtimes.find((s) => s._id.toString() === showtimeId);
      if (showtime) {
        screenName = sc.name;
        screen = sc;
        break;
      }
    }

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Check seat availability
    const bookedSeats = showtime.booked || [];
    const isAvailable = seats.every((seat) => !bookedSeats.includes(seat));
    if (!isAvailable) {
      return res.status(400).json({ message: "Some seats are already booked" });
    }

    // Calculate total price
    let totalPrice = 0;
    seats.forEach((seat) => {
      const category = showtime.seatCategories.find((cat) => cat.seats.includes(seat));
      if (category) totalPrice += category.price;
    });

    // Create booking entry
    const newBooking = await Booking.create({
      user: userId,
      showtimeId: showtime._id,
      Theater: theater._id,  // Reference to the theater
      screenName: screenName, // Screen name from the theater's screens
      seats: seats,
      totalPrice: totalPrice,
      status: 'confirmed',
    });

    // Update the showtime with booked seats
    showtime.booked.push(...seats);
    await theater.save();

    // Add booking reference to the user
    await User.findByIdAndUpdate(userId, { $push: { bookings: newBooking._id } });

    // Respond with the new booking
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("user")
      .populate("Theater");

    res.status(201).json({
      message: "Booking successful",
      booking: populatedBooking,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to book ticket", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {

      // Get all bookings for the current user and populate theater details
      const bookings = await Booking.find({ user: req.user.id })
          .populate('Theater', 'name location screens');

      // Arrays to collect processed data
      const movieIds = [];
      const validBookingsData = [];

      // First pass to collect movie IDs and validate bookings
      for (const booking of bookings) {
          const theater = booking.Theater;
          if (!theater) continue;

          // Find matching screen in theater
          const screen = theater.screens.find(s => s.name === booking.screenName);
          if (!screen) continue;

          // Find matching showtime in screen
          const showtime = screen.showtimes.id(booking.showtimeId);
          if (!showtime) continue;

          // Collect movie reference
          movieIds.push(showtime.movie);
          validBookingsData.push({
              booking,
              theater,
              screen,
              showtime
          });
      }

      // Get all movies in a single query
      const movies = await Movie.find({ _id: { $in: movieIds } })
          .select('title language duration');
      
      // Create movie map for quick lookup
      const movieMap = new Map();
      movies.forEach(movie => movieMap.set(movie._id.toString(), movie));

      // Prepare final response
      const result = validBookingsData.map(({ booking, theater, showtime }) => {
          const movie = movieMap.get(showtime.movie.toString());
          if (!movie) return null;

          return {
              bookingId: booking._id,
              theaterName: theater.name,
              screenName: booking.screenName,
              Location: theater.location,
              MovieTitle: movie.title,
              ShowTime: showtime.time,
              Language: movie.language,
              duration: movie.duration,
              status: booking.status // Add the status field
          };
      }).filter(Boolean); // Remove invalid entries

      res.status(200).json(result);
  } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};




// Controller for getting available seats for a showtime
exports.getAvailableSeats = async (req, res) => {
  const { showId } = req.body;

  if (!showId) {
    return res.status(400).json({ error: 'showId is required' });
  }

  try {
    // Find the theater with the specific showtime
    const theater = await Theater.findOne({
      'screens.showtimes._id': showId
    });

    if (!theater) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    // Find the specific screen and showtime
    let availableSeats = [];
    let totalSeats = 0; // To count total seats

    theater.screens.forEach(screen => {
      screen.showtimes.forEach(showtime => {
        if (showtime._id.toString() === showId) {
          const allSeats = showtime.seatCategories.flatMap(category => category.seats);
          const bookedSeats = showtime.booked || [];
          
          // Total seats count
          totalSeats = allSeats.length;

          // Filter out booked seats to get available ones
          availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));
        }
      });
    });

    return res.status(200).json({ availableSeats, totalSeats });
  } catch (error) {
    console.error('Error fetching available seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.searchLocation = async (req, res) => {
  try {
    // Fetch all theaters and extract locations
    const theaters = await Theater.find({}, 'location');

    // Extract unique locations
    const uniqueLocations = [...new Set(theaters.map((theater) => theater.location))];

    // Respond with the list of unique locations
    res.status(200).json({ locations: uniqueLocations });
  } catch (error) {
    console.error('Error fetching theater locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Step 1: Find the booking by ID and populate necessary fields
    const booking = await Booking.findById(bookingId)
      .populate('user')
      .populate({
        path: 'Theater',
        populate: {
          path: 'screens.showtimes',
          populate: {
            path: 'movie',
          },
        },
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Step 2: Check if the booking belongs to the authenticated user
    if (!booking.user || booking.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
    }

    // Step 3: Check if the booking is already canceled
    if (booking.user.cancelBookings.includes(bookingId)) {
      return res.status(400).json({ message: 'This booking has already been canceled' });
    }

    // Step 4: Update the booking status to 'cancelled'
    booking.status = 'cancelled';
    await booking.save();

    // Step 5: Free up the booked seats in the theater showtime
    const theater = booking.Theater;
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found for booking' });
    }

    let showtimeFound = false;
    let screenFound = false;

    // Find the showtime and screen where the booking belongs
    for (let screen of theater.screens) {
      const showtime = screen.showtimes.find(s => s._id.toString() === booking.showtimeId.toString());
      if (showtime) {
        screenFound = true;
        showtime.booked = showtime.booked.filter(seat => !booking.seats.includes(seat)); // Free up seats
        await theater.save(); // Save changes to theater (showtime booked seats updated)
        showtimeFound = true;
        break;
      }
    }

    if (!showtimeFound || !screenFound) {
      return res.status(404).json({ message: 'Showtime or screen not found for the selected booking' });
    }

    // Step 6: Remove booking reference from the user's bookings array and move it to cancelBookings array
    await User.updateOne(
      { _id: booking.user._id },
      {
        $pull: { bookings: bookingId },         // Remove from bookings array
        $push: { cancelBookings: bookingId }    // Add to cancelBookings array
      }
    );

    return res.status(200).json({ message: 'Booking successfully cancelled' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};


