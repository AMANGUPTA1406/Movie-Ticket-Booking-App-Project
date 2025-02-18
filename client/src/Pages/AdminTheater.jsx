import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarAdmin';

const AdminTheater = () => {
  const [theaters, setTheaters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    screens: [],
  });
  const [editingTheaterId, setEditingTheaterId] = useState(null);

  // Fetch all theaters
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await axios.get('/api/theaters/getall');
        setTheaters(response.data);
      } catch (error) {
        console.error('Error fetching theaters:', error);
      }
    };
    fetchTheaters();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission (for adding or editing theaters)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingTheaterId
      ? '/api/theaters/edit'
      : '/api/theaters/add'; // Use different route for adding and editing theaters

    try {
      if (editingTheaterId) {
        await axios.post(url, { ...formData, theaterId: editingTheaterId });
        setEditingTheaterId(null); // Clear the editing ID
      } else {
        await axios.post(url, formData); // Add new theater
      }
      setFormData({ name: '', location: '', screens: [] }); // Clear the form
      // Refresh theater list after submit
      const response = await axios.get('/api/theaters/getall');
      setTheaters(response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle editing a theater
  const handleEdit = (theater) => {
    setFormData({
      name: theater.name,
      location: theater.location,
      screens: theater.screens,
    });
    setEditingTheaterId(theater._id);
  };

  // Handle deleting a theater
  const handleDelete = async (theaterId) => {
    try {
      await axios.post('/api/theater/delete', { TheaterId: theaterId });
      setTheaters((prevTheaters) =>
        prevTheaters.filter((theater) => theater._id !== theaterId)
      );
    } catch (error) {
      console.error('Error deleting theater:', error);
    }
  };

  return (
    <div className="p-4">
    <NavbarAdmin />
    <div className="max-w-4xl mx-auto px-4 py-8">
        
      <h1 className="text-3xl font-bold text-center text-gray-100 mb-6">Admin - Theater Management</h1>

      {/* Form for adding or editing a theater */}
      <form className="bg-white p-6 rounded-lg shadow-lg mb-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">
            Theater Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Theater Name"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter Location"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {editingTheaterId ? 'Edit' : 'Add'} Theater
        </button>
      </form>

      <h2 className="text-2xl font-semibold text-gray-100 mb-4">All Theaters</h2>
      <div className="space-y-6">
        {theaters.map((theater) => (
          <div
            key={theater._id}
            className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{theater.name}</h3>
              <p className="text-gray-600">{theater.location}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => handleEdit(theater)}
                className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(theater._id)}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default AdminTheater;
