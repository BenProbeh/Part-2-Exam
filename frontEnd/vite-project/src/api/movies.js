const BASE_URL = import.meta.env.VITE_BACK_URL;

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function getAllMovies() {
  const res = await fetch(`${BASE_URL}/movies`);
  return parseResponse(res);
}

export async function addMovie(movie) {
  const res = await fetch(`${BASE_URL}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });
  return parseResponse(res);
}

export async function deleteMovie(id) {
  const res = await fetch(`${BASE_URL}/movies/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(res);
}

export async function searchMovies(name, signal) {
  const res = await fetch(
    `${BASE_URL}/movies/search?name=${encodeURIComponent(name)}`,
    { signal }
  );
  return parseResponse(res);
}

export async function generateDescription(title, genre) {
  const res = await fetch(`${BASE_URL}/movies/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, genre }),
  });
  return parseResponse(res);
}
