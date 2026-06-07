import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AllMovies from './pages/AllMovies';
import AddMovie from './pages/AddMovie';
import SearchMovies from './pages/SearchMovies';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/all-movies" replace />} />
          <Route path="/all-movies" element={<AllMovies />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="/search-movies" element={<SearchMovies />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
