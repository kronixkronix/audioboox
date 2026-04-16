import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search as SearchIcon, BookOpen, Heart, Star, Loader } from 'lucide-react';

const useDebounce = (fn, delay) => {
  const timer = React.useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};

const BookCard = ({ book }) => (
  <Link to={`/book/${book.id}`} className="group flex gap-4 glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
    <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
      {book.cover_image
        ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={24} className="text-gray-400" /></div>
      }
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-primary truncate group-hover:text-green-600 transition">{book.title}</h3>
      <p className="text-sm text-secondary">{book.author}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
        <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" />{book.likes_count}</span>
        {book.avg_rating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" />{book.avg_rating}</span>}
      </div>
    </div>
  </Link>
);

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`books/?search=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const debouncedSearch = useDebounce(doSearch, 400);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      {/* Search hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-900 dark:to-green-800 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-8">Find your next great read</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="search-input"
              type="text"
              autoFocus
              value={query}
              onChange={handleChange}
              placeholder="Search by title or author..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg bg-white dark:bg-gray-900 text-primary shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
            {loading && <Loader className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-spin" size={20} />}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <SearchIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-secondary text-lg">No books found for "<strong>{query}</strong>"</p>
          </div>
        )}
        {!loading && results.length > 0 && (
          <>
            <p className="text-secondary text-sm mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"</p>
            <div className="space-y-3">
              {results.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </>
        )}
        {!searched && (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-secondary">Start typing to search the collection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
