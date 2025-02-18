import React from "react";
import { Link } from "react-router-dom";

const NavbarAdmin = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Movie Ticket Booking</h1>
      <div className="space-x-4">
        <Link to="/Admin/Home" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Home</Link>
        <Link to="/Admin/Movie" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Movies</Link>
        <Link to="/Admin/Theater" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Theaters</Link>
        <Link to="/Admin/User" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Users</Link>
        <Link to="/User/search" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Search Movies</Link>
        <Link to="/bookTicket" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Book Tickets</Link>
        {/* <Link to="/profile" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Profile</Link> */}
        <Link to="/User/Booking" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">My Bookings</Link>
        <Link to="/login" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Logout</Link>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
