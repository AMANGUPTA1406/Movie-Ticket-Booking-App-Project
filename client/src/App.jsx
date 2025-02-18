import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './Pages/Login';
import Register from './Pages/Register';
import HomeUser from './Pages/HomeUser';
import SearchMovie from './Pages/SearchMovie';
import BookTicketPage from './Pages/BookTicket';
import AdminMovie from './Pages/AdminMovie';
import HomeAdmin from './Pages/HomeAdmin';
import AdminTheater from './Pages/AdminTheater';
import AdminUser from './Pages/AdminUser';
import MyBooking from './Pages/MyBooking';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Toaster position="top-center" />
        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/User/Home" element={<HomeUser />} />
          <Route path="/User/search" element={<SearchMovie/>} />
          <Route path="/bookTicket" element={<BookTicketPage/>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/Admin/Home" element={<HomeAdmin />} />
          <Route path="/Admin/Movie" element={<AdminMovie />} />
          <Route path="/Admin/Theater" element={<AdminTheater />} />
          <Route path="/Admin/User" element={<AdminUser />} />
          <Route path="/User/Booking" element={<MyBooking/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;