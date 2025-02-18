import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import NavbarAdmin from '../components/NavbarAdmin';

const BookTicketPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [screensAndShowtimes, setScreensAndShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showPurchaseSlip, setShowPurchaseSlip] = useState(false);
  const ticketPrice = 150; // Example price per seat
  const [selectedShowtimeDetails, setSelectedShowtimeDetails] = useState(null);

  const user = useSelector((state) => state.user);
  const userId = user.id;

  useEffect(() => {
    axios.post('/api/bookings/getAllLocations').then((response) => {
      setLocations(response.data.locations);
    });
  }, []);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    axios
      .post('/api/theaters/search/TheaterBylocation', { location })
      .then((response) => setTheaters(response.data));
  };

  const handleTheaterChange = (theaterId) => {
    setSelectedTheater(theaterId);
    axios
      .post('/api/movies/search/movieByTheater', { theaterId })
      .then((response) => setMovies(response.data.movies));
  };

  const handleMovieChange = (movieId) => {
    setSelectedMovie(movieId);
    axios
      .post('/api/movies/search/screenAndShowTime', { theaterId: selectedTheater, movieId })
      .then((response) => setScreensAndShowtimes(response.data.screens));
  };

// Updated handleShowtimeChange
const handleShowtimeChange = (showId) => {
  setSelectedShowtime(showId);

  // Find and store the selected showtime details
  const showtimeDetails = screensAndShowtimes
    .flatMap((screen) => screen.showtimes)
    .find((showtime) => showtime.showId === showId);

  setSelectedShowtimeDetails(showtimeDetails);

  axios.post('/api/bookings/availableSeats', { showId }).then((response) => {
    setAvailableSeats(response.data.availableSeats);
    setTotalSeats(response.data.totalSeats);
  });
};

  const toggleSeatSelection = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookTicket = () => {
    axios
      .post('/api/bookings/bookMovie', {
        userId,
        theaterId: selectedTheater,
        showtimeId: selectedShowtime,
        seats: selectedSeats,
      })
      .then(() => {
        toast.success('Booking confirmed!');
        setShowPurchaseSlip(false); // Hide purchase slip after successful booking
        setSelectedSeats([]);
      })
      .catch((error) => {
        toast.error('Booking failed: ' + error.message);
      });
  };

  return (
    <div className="p-4">
      {user.role === 'admin' ? <NavbarAdmin /> : <Navbar />}
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">Book Your Ticket</h1>
        {/* Step 1: Select Location */}
        <div className="mb-6">
          <label className="text-lg font-semibold text-gray-700">Select Location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-3 mt-2 border rounded-md text-gray-800"
          >
            <option value="">Select Location</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Theater */}
        <div className="mb-6">
          <label className="text-lg font-semibold text-gray-700">Select Theater:</label>
          <select
            value={selectedTheater}
            onChange={(e) => handleTheaterChange(e.target.value)}
            disabled={!selectedLocation}
            className="w-full p-3 mt-2 border rounded-md text-gray-800"
          >
            <option value="">Select Theater</option>
            {theaters.map((theater) => (
              <option key={theater._id} value={theater._id}>
                {theater.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Select Movie */}
        <div className="mb-6">
          <label className="text-lg font-semibold text-gray-700">Select Movie:</label>
          <select
            value={selectedMovie}
            onChange={(e) => handleMovieChange(e.target.value)}
            disabled={!selectedTheater}
            className="w-full p-3 mt-2 border rounded-md text-gray-800"
          >
            <option value="">Select Movie</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Step 4: Select Screen and Showtime */}
        <div className="mb-6">
          <label className="text-lg font-semibold text-gray-700">Select Screen and Showtime:</label>
          <select
            value={selectedShowtime}
            onChange={(e) => handleShowtimeChange(e.target.value)}
            disabled={!selectedMovie}
            className="w-full p-3 mt-2 border rounded-md text-gray-800"
          >
            <option value="">Select Showtime</option>
            {screensAndShowtimes.map((screen) =>
              screen.showtimes.map((showtime) => (
                <option key={showtime.showId} value={showtime.showId}>
                  {screen.screenName} - {new Date(showtime.time).toLocaleString()}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Step 5: Display All Seats */}
        {availableSeats.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select Seats:</h2>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: totalSeats }, (_, index) => index + 1).map((seat) => (
                <div
                  key={seat}
                  className={`p-3 border rounded-md ${
                    selectedSeats.includes(seat)
                      ? 'bg-green-500'
                      : availableSeats.includes(seat)
                      ? 'bg-gray-200'
                      : 'bg-red-500'
                  } cursor-pointer`}
                  onClick={() => availableSeats.includes(seat) && toggleSeatSelection(seat)}
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>
        )}

{showPurchaseSlip && (
  <div className="p-4 bg-gray-100 rounded-md shadow-md mb-6">
    <h2 className="text-xl font-semibold mb-4">Purchase Slip</h2>
    <p><strong>Location:</strong> {selectedLocation}</p>
    <p><strong>Theater:</strong> {theaters.find((t) => t._id === selectedTheater)?.name}</p>
    <p>
      <strong>Showtime:</strong> {selectedShowtimeDetails ? 
      `${new Date(selectedShowtimeDetails.time).toLocaleString()}` : ''}
    </p>
    <p><strong>Seats:</strong> {selectedSeats.join(', ')}</p>
    <p><strong>Total Amount:</strong> ₹{selectedSeats.length * ticketPrice}</p>
    <button
      onClick={handleBookTicket}
      className="bg-green-500 text-white py-2 px-4 rounded-md mt-4"
    >
      Pay and Book
    </button>
  </div>
)}


        {/* Step 7: Proceed to Purchase Button */}
        <div className="text-center">
          <button
            onClick={() => setShowPurchaseSlip(true)}
            className="bg-blue-500 text-white py-3 px-6 rounded-full text-lg"
            disabled={!selectedShowtime || selectedSeats.length === 0}
          >
            Proceed to Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookTicketPage;
