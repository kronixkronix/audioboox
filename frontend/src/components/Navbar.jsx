import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, Upload, Sun, Moon, Library, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  const username = localStorage.getItem('username');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm transition-colors duration-300 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-green-600 hover:text-green-500 transition">
              <BookOpen size={28} />
              <span className="text-xl font-bold tracking-tight text-primary">AudioBlink</span>
            </Link>
            <Link to="/search" id="nav-search-link" className="hidden sm:flex items-center gap-1.5 text-sm text-secondary hover:text-green-600 transition">
              <Search size={16} /> Search
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {/* Mobile search */}
            <Link to="/search" id="nav-search-mobile" className="sm:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-secondary">
              <Search size={20} />
            </Link>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-secondary" aria-label="Toggle theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {token ? (
              <>
                <Link to="/library" id="nav-library-link" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-secondary" aria-label="Library">
                  <Library size={20} />
                </Link>
                <NotificationBell />
                <Link to="/upload" className="hidden sm:flex items-center space-x-1 text-secondary hover:text-green-600 transition text-sm font-medium">
                  <Upload size={18} className="mr-1" /> Upload
                </Link>
                <Link
                  to={`/profile/${userId}`}
                  id="nav-profile-link"
                  className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-green-600 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {username ? username[0].toUpperCase() : <User size={16} />}
                  </div>
                </Link>
                <button onClick={handleLogout} id="nav-logout-btn" className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary hover:text-red-500 transition" aria-label="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition">Log in</Link>
                <Link to="/register" className="text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition shadow-md shadow-green-600/20">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
