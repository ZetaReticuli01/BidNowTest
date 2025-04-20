import { useEffect, useState } from "react";
import axios from "axios";

const Movie = () => {
  const [movies, setMovies] = useState([]);
  const api = `https://www.omdbapi.com/?i=tt3896198&apikey=1c12799f&s=titanic&page=1`;

  const getMovieData = async () => {
    try {
      const res = await axios.get(api);
      console.log(res.data);
      setMovies(res.data.Search || []);
    } catch (err) {
      console.log("Error fetching data", err);
    }
  };

  useEffect(() => {
    getMovieData();
  }, []);

  return (
    <div>
      <h2>Movies List</h2>
      {movies.length > 0 ? (
        <ul>
          {movies.map((movie) => (
            <li key={movie.imdbID}>{movie.Title}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Movie;
