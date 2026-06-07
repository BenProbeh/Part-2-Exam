import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { deleteMovie, getAllMovies } from '../api/movies';

function AllMovies() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchMovies() {
      try {
        const data = await getAllMovies();
        setMovies(data);
      } catch {
        setError('Failed to load movies');
      }
    }

    fetchMovies();

    return () => abortController.abort();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteMovie(id);
      setMovies(prev => prev.filter(m => m._id !== id));
    } catch {
      setError('Failed to delete movie');
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="page-title text-4xl font-bold tracking-tight">All Movies</h1>
        <p className="page-subtitle mt-2 text-sm">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your watchlist
        </p>
      </div>

      {error && (
        <p className="storm-error mb-4 rounded-xl px-4 py-3 text-sm">{error}</p>
      )}

      {movies.length === 0 ? (
        <p className="text-zinc-500">No movies in your watchlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllMovies;
