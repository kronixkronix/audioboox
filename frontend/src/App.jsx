import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Listen from './pages/Listen';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlists from './pages/Playlists';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-primary min-h-screen transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/listen/:id" element={<Listen />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<Playlists />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;
