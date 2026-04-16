import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Headphones, BookOpen, Clock, Heart } from 'lucide-react';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('books/');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-800 dark:to-green-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-pulse">
            Big ideas in small packages
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl font-light opacity-90 mb-10">
            Read or listen to the key insights from bestselling nonfiction books in minutes. Upload your own PDFs and share wisdom.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition shadow-lg transform hover:-translate-y-1">
              Start your free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Book Grid */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary flex items-center">
            <BookOpen className="mr-2 text-green-600" /> Discover Books
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} className="group flex flex-col glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-300">
                      <BookOpen size={48} className="text-gray-400 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                    <Heart size={14} className="mr-1 text-red-500" /> {book.likes_count}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-primary mb-1 line-clamp-1 group-hover:text-green-600 transition">{book.title}</h3>
                  <p className="text-sm text-secondary mb-4">{book.author}</p>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-400 font-medium">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" /> 15m read
                    </div>
                    <div className="flex items-center text-green-600">
                      <Headphones size={14} className="mr-1" /> Listen
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {books.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No books available yet. Be the first to upload one!
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
