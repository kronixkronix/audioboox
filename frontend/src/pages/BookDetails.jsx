import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { Play, Heart, BookOpen, UploadCloud, MessageSquare, Headphones, Bookmark, Share2, ListMusic, Send, CheckCheck, X } from 'lucide-react';
import StarRating from '../components/StarRating';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    fetchBook();
    fetchComments();
    if (isLoggedIn) fetchPlaylists();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await api.get(`books/${id}/`);
      setBook(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`books/${id}/comment/`);
      setComments(res.data);
    } catch (_) {}
  };

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('playlists/');
      setPlaylists(res.data);
    } catch (_) {}
  };

  const handleLike = async () => {
    if (!isLoggedIn) { alert('Please log in to like books'); return; }
    try {
      const res = await api.post(`books/${id}/like/`);
      setBook((prev) => ({ ...prev, likes_count: res.data.likes_count, is_liked: res.data.is_liked }));
    } catch (_) {}
  };

  const handleSave = async () => {
    if (!isLoggedIn) { alert('Please log in to save books'); return; }
    try {
      const res = await api.post(`books/${id}/save_book/`);
      setBook((prev) => ({ ...prev, is_saved: res.data.is_saved }));
    } catch (_) {}
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/book/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch (_) { alert(`Share this link: ${url}`); }
  };

  const handleRate = async (stars) => {
    if (!isLoggedIn) { alert('Please log in to rate books'); return; }
    try {
      const res = await api.post(`books/${id}/rate/`, { stars });
      setBook((prev) => ({ ...prev, avg_rating: res.data.avg_rating, ratings_count: res.data.ratings_count, user_rating: res.data.stars }));
    } catch (_) {}
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`books/${id}/comment/`, { text: newComment });
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
    } catch (_) {}
    finally { setCommentLoading(false); }
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`playlists/${playlistId}/add_book/`, { book_id: id });
      setAddedPlaylists((prev) => new Set([...prev, playlistId]));
    } catch (_) {}
  };

  if (loading) return (
    <div className="flex justify-center py-40 bg-primary min-h-screen transition-colors duration-300">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
  if (!book) return <div className="text-center py-20 min-h-screen text-secondary text-xl font-medium">Book not found</div>;

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-secondary border-b border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden pb-12 transition-colors duration-300">
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 opacity-50 z-0"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Cover */}
            <div className="w-48 md:w-56 shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-700 aspect-[3/4]">
              {book.cover_image
                ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={64} className="text-gray-400 opacity-50" /></div>
              }
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-2 leading-tight">{book.title}</h1>
              <Link to={`/profile/${book.uploader?.id}`} className="text-2xl text-secondary font-medium mb-1 hover:text-green-600 transition block">by {book.author}</Link>

              {/* Star Rating */}
              <div className="mt-3 mb-6">
                <StarRating
                  avgRating={book.avg_rating || 0}
                  ratingsCount={book.ratings_count || 0}
                  userRating={book.user_rating || 0}
                  onRate={handleRate}
                  readOnly={!isLoggedIn}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Link to={`/listen/${book.id}`} id="book-listen-btn" className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-lg shadow-green-600/30 transform hover:-translate-y-1">
                  <Play size={20} className="mr-2" /> Read & Listen
                </Link>
                <button
                  onClick={handleLike}
                  id="book-like-btn"
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition transform hover:-translate-y-1 ${book.is_liked ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800' : 'glass-panel text-secondary hover:text-red-500'}`}
                >
                  <Heart size={18} fill={book.is_liked ? 'currentColor' : 'none'} /> {book.likes_count}
                </button>
                <button
                  onClick={handleSave}
                  id="book-save-btn"
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition transform hover:-translate-y-1 ${book.is_saved ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800' : 'glass-panel text-secondary hover:text-green-600'}`}
                  title={book.is_saved ? 'Remove from Library' : 'Save to Library'}
                >
                  <Bookmark size={18} fill={book.is_saved ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} id="book-share-btn" className="relative flex items-center gap-2 px-5 py-3 glass-panel rounded-full font-semibold text-secondary hover:text-blue-600 transition transform hover:-translate-y-1" title="Copy link">
                  {shareToast ? <><CheckCheck size={18} className="text-green-500" /> Copied!</> : <><Share2 size={18} /> Share</>}
                </button>
                {isLoggedIn && (
                  <button onClick={() => setShowPlaylistModal(true)} id="book-playlist-btn" className="flex items-center gap-2 px-5 py-3 glass-panel rounded-full font-semibold text-secondary hover:text-purple-600 transition transform hover:-translate-y-1">
                    <ListMusic size={18} /> Playlist
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm font-medium text-secondary">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"><MessageSquare size={14} className="mr-1.5 text-blue-500" /> {book.comments_count} comments</div>
                <Link to={`/profile/${book.uploader?.id}`} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition">
                  <UploadCloud size={14} className="mr-1.5" /> @{book.uploader?.username}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold mb-6 text-primary border-b border-gray-200 dark:border-gray-800 pb-4">What's it about?</h3>
        <p className="text-secondary leading-relaxed text-lg whitespace-pre-wrap">{book.description || "No description provided."}</p>

        <div className="mt-10 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full text-blue-600 dark:text-blue-400">
            <Headphones size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-primary">Audio Narration Available</h4>
            <p className="text-secondary mt-1">Powered by Microsoft Edge TTS. Click "Read & Listen" to choose a voice and start narration with synchronized paragraph highlighting.</p>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h3 className="text-2xl font-bold mb-6 text-primary border-b border-gray-200 dark:border-gray-800 pb-4">
          Comments <span className="text-secondary font-normal text-lg ml-1">({comments.length})</span>
        </h3>

        {isLoggedIn && (
          <form onSubmit={postComment} className="flex gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {localStorage.getItem('username')?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 glass-panel rounded-2xl flex gap-2 px-4 py-2 items-center border border-gray-200 dark:border-gray-700">
              <input
                id="comment-input"
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-primary placeholder:text-secondary focus:outline-none text-sm"
              />
              <button type="submit" disabled={commentLoading || !newComment.trim()} id="comment-submit-btn" className="p-1.5 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition disabled:opacity-40">
                <Send size={18} />
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {comments.length === 0 && <p className="text-secondary text-sm text-center py-8">No comments yet. Be the first!</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 glass-panel p-4 rounded-2xl">
              <Link to={`/profile/${c.user?.id}`} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:opacity-80 transition">
                {c.user?.username?.[0]?.toUpperCase()}
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/profile/${c.user?.id}`} className="font-semibold text-sm text-primary hover:text-green-600 transition">@{c.user?.username}</Link>
                  <span className="text-xs text-secondary">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-secondary text-sm leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-primary">Add to Playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)} className="text-secondary hover:text-primary"><X size={20} /></button>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-secondary text-sm mb-3">You have no playlists yet.</p>
                  <Link to="/playlists" onClick={() => setShowPlaylistModal(false)} className="text-green-600 text-sm font-semibold hover:underline">Create a playlist →</Link>
                </div>
              ) : playlists.map((pl) => (
                <button key={pl.id} onClick={() => addToPlaylist(pl.id)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left mb-1">
                  <div className="flex items-center gap-3">
                    <ListMusic size={18} className="text-purple-500" />
                    <span className="text-primary text-sm font-medium">{pl.name}</span>
                    <span className="text-secondary text-xs">({pl.books_count} books)</span>
                  </div>
                  {addedPlaylists.has(pl.id) && <CheckCheck size={16} className="text-green-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
