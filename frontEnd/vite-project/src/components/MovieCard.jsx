function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function MovieCard({ movie, onDelete }) {
  return (
    <div className="storm-card flex flex-col rounded-2xl p-4 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-bold text-zinc-100 sm:text-lg">{movie.title}</h3>
        <span className="genre-badge max-w-[45%] shrink-0 truncate rounded-lg px-2.5 py-1 text-xs font-semibold">
          {movie.genre}
        </span>
      </div>
      <p className="mb-5 flex-1 break-words text-sm leading-relaxed text-zinc-400">{movie.description}</p>
      <button
        onClick={() => onDelete(movie._id)}
        className="glow-btn glow-btn-danger flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        <TrashIcon />
        Delete Movie
      </button>
    </div>
  );
}

export default MovieCard;
