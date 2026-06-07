import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMovie, generateDescription } from '../api/movies';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary'];

function validateForm(title, genre, description) {
  const errors = {};

  if (!title.trim()) {
    errors.title = 'Movie title is required';
  } else if (title.length > 20) {
    errors.title = 'Movie title must be at most 20 characters';
  }

  if (!genre.trim()) {
    errors.genre = 'Genre is required';
  }

  if (!description.trim()) {
    errors.description = 'Description is required';
  } else if (description.length > 200) {
    errors.description = 'Description must be at most 200 characters';
  }

  return errors;
}

function SparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function AddMovie() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGenerate() {
    const validationErrors = validateForm(title, genre, description);
    if (validationErrors.title || validationErrors.genre) {
      setErrors({
        title: validationErrors.title,
        genre: validationErrors.genre,
      });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      const data = await generateDescription(title, genre);
      setDescription(data.description || '');
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(title, genre, description);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await addMovie({ title: title.trim(), genre, description: description.trim() });
      navigate('/all-movies');
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="page-title text-4xl font-bold tracking-tight">Add New Movie</h1>
        <p className="page-subtitle mt-2 text-sm">Fill in the details to add a movie to your watchlist.</p>
      </div>

      <div className="storm-card max-w-xl rounded-2xl p-8">
        {errors.general && (
          <p className="storm-error mb-4 rounded-xl px-4 py-3 text-sm">{errors.general}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Movie Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. The Matrix"
              maxLength={20}
              className={`storm-input w-full rounded-xl px-4 py-3 text-sm ${
                errors.title ? 'storm-input-error' : ''
              }`}
            />
            {errors.title && <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="genre" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Genre
            </label>
            <select
              id="genre"
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className={`storm-input w-full rounded-xl px-4 py-3 text-sm ${
                errors.genre ? 'storm-input-error' : ''
              }`}
            >
              <option value="">Select a genre</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.genre && <p className="mt-1.5 text-sm text-red-400">{errors.genre}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Short Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of the movie..."
              rows={4}
              maxLength={200}
              className={`storm-input w-full resize-none rounded-xl px-4 py-3 text-sm ${
                errors.description ? 'storm-input-error' : ''
              }`}
            />
            {errors.description && <p className="mt-1.5 text-sm text-red-400">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="glow-btn glow-btn-ai flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <SparkleIcon />
              {isGenerating ? 'Generating...' : 'Generate Description With AI'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="glow-btn glow-btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <PlusIcon />
              {isSubmitting ? 'Adding...' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMovie;
