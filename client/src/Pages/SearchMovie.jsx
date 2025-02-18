import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from "../components/Navbar";
import { useSelector } from 'react-redux';
import NavbarAdmin from '../components/NavbarAdmin';

const SearchMovie = () => {
  const [searchType, setSearchType] = useState('title'); // Default search type
  const [searchValue, setSearchValue] = useState('');
  const [movies, setMovies] = useState([]);
  const user = useSelector((state) => state.user);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchValue) {
      toast.error(`Please enter a ${searchType} to search.`);
      return;
    }

    try {
      let response;
      if (searchType === 'title') {
        response = await axios.post('/api/movies/search/title', { title: searchValue });
      } else if (searchType === 'location') {
        response = await axios.post('/api/movies/search/location', { location: searchValue });
      } else if (searchType === 'time') {
        response = await axios.post('/api/movies/search/showtime', { time: searchValue });
      }

      setMovies(response.data);
      if (response.data.length === 0) {
        toast('No movies found for your search.');
      } else {
        toast.success('Movies found!');
      }
    } catch (error) {
      toast.error('Failed to fetch movies. Please try again.');
      console.error('Error searching movies:', error);
    }
  };

  return (
    <div className="p-4">
    {user.role === "admin" ? <NavbarAdmin /> : <Navbar />}
    <div className="container p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-700">Search Movies</h1>

      {/* Search Type Selector */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
        <label htmlFor="searchType" className="text-lg text-gray-600 mb-2 md:mb-0">Search By:</label>
        <select
          id="searchType"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full md:w-auto p-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="title">Title</option>
          <option value="location">Location</option>
          <option value="time">Time</option>
        </select>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        {searchType === 'time' ? (
          <input
            type="datetime-local"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type="text"
            placeholder={`Enter ${searchType}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Search Button */}
      <div className="text-center">
        <button
          onClick={handleSearch}
          className="w-full md:w-1/4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </div>

      {/* Display Movies in Table */}
      {movies.length > 0 && (
        <div className="mt-8">
          <table className="w-full table-auto border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-blue-100 text-left text-gray-700">
                <th className="border border-gray-300 p-3">Movie Title</th>
                <th className="border border-gray-300 p-3">Theater Name</th>
                <th className="border border-gray-300 p-3">Location</th>
                <th className="border border-gray-300 p-3">Showtimes</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movieData, index) =>
                movieData.theaters.map((theater, theaterIndex) => (
                  <tr key={`${index}-${theaterIndex}`} className="border-b hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">{movieData.movie.title}</td>
                    <td className="border border-gray-300 p-3">{theater.theaterName}</td>
                    <td className="border border-gray-300 p-3">{theater.location}</td>
                    <td className="border border-gray-300 p-3">
                      {theater.showtimes
                        .map((showtime) => new Date(showtime.time).toLocaleString())
                        .join(', ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
};

export default SearchMovie;
