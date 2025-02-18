import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import NavbarAdmin from '../components/NavbarAdmin';

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.post('/api/bookings/myBookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.post('/api/bookings/cancel', { bookingId });
      if (response.status === 200) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.bookingId === bookingId
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        alert('Booking successfully cancelled');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel the booking');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  return (
    <div className="p-4">
    {user.role === "admin" ? <NavbarAdmin /> : <Navbar />}
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-100">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="p-4 border rounded-lg shadow-lg bg-white">
              <h2 className="font-semibold text-xl mb-2">{booking.MovieTitle}</h2>
              <p>Theater: {booking.theaterName}</p>
              <p>Screen: {booking.screenName}</p>
              <p>Location: {booking.Location}</p>
              <p>Show Time: {new Date(booking.ShowTime).toLocaleString()}</p>
              <p>Language: {booking.Language}</p>
              <p>Duration: {booking.duration} minutes</p>
              <p>Status: {booking.status}</p>
              <button
                className={`mt-4 px-4 py-2 rounded ${
                  booking.status === 'cancelled'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                disabled={booking.status === 'cancelled'}
                onClick={() => handleCancelBooking(booking.bookingId)}
              >
                {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel Booking'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default MyBooking;
