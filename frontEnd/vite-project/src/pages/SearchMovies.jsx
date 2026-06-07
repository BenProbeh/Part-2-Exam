import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { deleteMovie, searchMovies } from '../api/movies';

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function SearchMovies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      return;
    }

    const abortController = new AbortController();

    async function fetchResults() {
      try {
        const data = await searchMovies(query.trim(), abortController.signal);
        setResults(data);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to search movies');
        }
      }
    }

    fetchResults();

    return () => abortController.abort();
  }, [query]);

  async function handleDelete(id) {
    try {
      await deleteMovie(id);
      setResults(prev => prev.filter(m => m._id !== id));
    } catch {
      setError('Failed to delete movie');
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="page-title text-4xl font-bold tracking-tight">Search Movie</h1>
        <p className="page-subtitle mt-2 text-sm">Search by movie title.</p>
      </div>

      <div className="relative mb-6 max-w-xl">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="storm-input w-full rounded-xl py-3 pl-12 pr-4 text-sm"
        />
      </div>

      {query.trim() && (
        <p className="page-subtitle mb-6 text-sm">
          {results.length} {results.length === 1 ? 'result' : 'results'} for &apos;{query.trim()}&apos;
        </p>
      )}

      {error && (
        <p className="storm-error mb-4 rounded-xl px-4 py-3 text-sm">{error}</p>
      )}

      {query.trim() && results.length === 0 && !error ? (
        <p className="text-zinc-500">No movies found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map(movie => (
            <MovieCard key={movie._id} movie={movie} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchMovies;
