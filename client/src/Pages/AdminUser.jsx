import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarAdmin';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post('/api/auth/getall', null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching users');
        setLoading(false);
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  // Function to handle canceling the booking
  const cancelBooking = async (bookingId) => {
    try {
      const response = await axios.post(
        '/api/bookings/cancel',
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert(response.data.message); // Show success message
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.bookings.includes(bookingId)) {
            user.cancelBookings.push(bookingId); // Add to canceled bookings
            user.bookings = user.bookings.filter((id) => id !== bookingId); // Remove from active bookings
          }
          return user;
        });
      });
    } catch (err) {
      alert('Error canceling booking');
      console.error(err);
    }
  };

  // Render the loading or error state
  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <NavbarAdmin />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">All Users</h1>

        {/* Table to display user details */}
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Bookings</th>
              <th className="py-3 px-6 text-left">Cancel Bookings</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{user.name}</td>
                <td className="py-4 px-6">{user.email}</td>
                <td className="py-4 px-6">{user.role}</td>
                <td className="py-4 px-6">
                  {user.bookings && user.bookings.length > 0 ? (
                    <ul className="space-y-2">
                      {user.bookings.map((bookingId, index) => (
                        <li key={index} className="flex items-center space-x-4">
                          <span>Booking ID: {bookingId}</span>
                          <button
                            onClick={() => cancelBooking(bookingId)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                          >
                            Cancel
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No bookings</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {user.cancelBookings && user.cancelBookings.length > 0 ? (
                    <ul>
                      {user.cancelBookings.map((cancelId, index) => (
                        <li key={index}>Booking ID: {cancelId}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No canceled bookings</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUser;
