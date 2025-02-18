import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const HomeUser = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Fetch movies from the backend
    axios.post("/api/movies/getall")
      .then((response) => setMovies(response.data))
      .catch((error) => console.error("Failed to fetch movies", error));
  }, []);

  return (
    <div className="p-4">
        <Navbar />
        <h2 className="text-4xl font-extrabold mb-6 text-white text-center bg-gray-900 py-4 rounded-lg shadow-md">
  Available Movies
</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white shadow-lg rounded-lg p-4">
            <h3 className="text-lg font-bold">{movie.title}</h3>
            <p className="text-sm text-gray-600">Genre: {movie.genre}</p>
            <p className="text-sm text-gray-600">Duration: {movie.duration} mins</p>
            <p className="text-sm text-gray-600">Language: {movie.language}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeUser;
