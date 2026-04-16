import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Library as LibraryIcon, BookOpen, Heart, Star, Bookmark, ArrowRight } from 'lucide-react';

const Library = () => {
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchSavedBooks();
  }, []);

  const fetchSavedBooks = async () => {
    try {
      const res = await api.get('profiles/saved_books/');
      setSavedBooks(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const unsave = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`books/${bookId}/save_book/`);
      setSavedBooks((prev) => prev.filter(b => b.id !== bookId));
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600">
            <LibraryIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-primary">My Library</h1>
            <p className="text-secondary text-sm mt-0.5">Books you've saved for later</p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
          </div>
        )}

        {!loading && savedBooks.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <Bookmark size={56} className="text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-bold text-primary">Your library is empty</h2>
            <p className="text-secondary">Save books from the explore page to read them later</p>
            <Link to="/" className="flex items-center gap-2 mt-4 px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition">
              Browse Books <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {!loading && savedBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBooks.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} className="group relative glass-panel rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="relative h-40 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  {book.cover_image
                    ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={36} className="text-gray-400 opacity-50" /></div>
                  }
                  <button
                    onClick={(e) => unsave(book.id, e)}
                    title="Remove from library"
                    className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-full text-green-600 shadow-sm hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-primary truncate group-hover:text-green-600 transition">{book.title}</h3>
                  <p className="text-sm text-secondary">{book.author}</p>
                  <div className="flex items-center gap-3 mt-auto pt-3 text-xs text-secondary">
                    <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" />{book.likes_count}</span>
                    {book.avg_rating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" />{book.avg_rating}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
