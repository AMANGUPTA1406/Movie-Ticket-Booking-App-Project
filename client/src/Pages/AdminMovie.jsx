import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarAdmin';

const AdminMovie = () => {
  const [movies, setMovies] = useState([]);
  const [movieForm, setMovieForm] = useState({
    movieId: '',
    title: '',
    genre: '',
    duration: '',
    language: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.post('/api/movies/getall'); // Fetch all movies
      setMovies(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/movies/add', movieForm);
      fetchMovies(); // Refresh movie list
      resetForm();
      alert('Movie added successfully');
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie');
    }
  };

  // Edit movie (populate form with movie details)
  const handleEditClick = (movie) => {
    setMovieForm({ ...movie, movieId: movie._id });
    setIsEditing(true);
  };

  // Submit edited movie details
  const handleEditMovie = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/movies/edit', movieForm);
      fetchMovies();
      resetForm();
      alert('Movie updated successfully');
    } catch (error) {
      console.error('Error editing movie:', error);
      alert('Failed to update movie');
    }
  };

  // Delete movie by ID
  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.post('/api/movies/delete', { movieId });
        fetchMovies();
        alert('Movie deleted successfully');
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Failed to delete movie');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setMovieForm({ movieId: '', title: '', genre: '', duration: '', language: '' });
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <NavbarAdmin />
      <h1 className="text-4xl font-extrabold mb-3 text-center text-gray-100">Admin Movie Management</h1>

      {/* Movie Form */}
      <form onSubmit={isEditing ? handleEditMovie : handleAddMovie} className="mb-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-3">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>

        <div className="mb-4">
          <label className="block font-medium mb-1">Title:</label>
          <input
            type="text"
            name="title"
            value={movieForm.title}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Genre:</label>
          <input
            type="text"
            name="genre"
            value={movieForm.genre}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Duration (minutes):</label>
          <input
            type="number"
            name="duration"
            value={movieForm.duration}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Language:</label>
          <input
            type="text"
            name="language"
            value={movieForm.language}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
          {isEditing ? 'Update Movie' : 'Add Movie'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded ml-4"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Movie List */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">All Movies</h2>
      <table className="w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-4 text-left">Title</th>
            <th className="border border-gray-300 p-4 text-left">Genre</th>
            <th className="border border-gray-300 p-4 text-left">Duration</th>
            <th className="border border-gray-300 p-4 text-left">Language</th>
            <th className="border border-gray-300 p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie._id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-4">{movie.title}</td>
              <td className="border border-gray-300 p-4">{movie.genre}</td>
              <td className="border border-gray-300 p-4">{movie.duration} min</td>
              <td className="border border-gray-300 p-4">{movie.language}</td>
              <td className="border border-gray-300 p-4">
                <button
                  onClick={() => handleEditClick(movie)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMovie(movie._id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminMovie;
