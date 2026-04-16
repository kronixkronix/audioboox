import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ListMusic, Plus, BookOpen, Trash2, X, ChevronRight } from 'lucide-react';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { navigate('/login'); return; }
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('playlists/');
      setPlaylists(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await api.post('playlists/', { name: newName });
      setPlaylists((prev) => [res.data, ...prev]);
      setNewName('');
      setShowCreate(false);
    } catch (_) {}
  };

  const deletePlaylist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this playlist?')) return;
    try {
      await api.delete(`playlists/${id}/`);
      setPlaylists((prev) => prev.filter(p => p.id !== id));
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600">
              <ListMusic size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-primary">My Playlists</h1>
              <p className="text-secondary text-sm">Curate your personal reading/listening queues</p>
            </div>
          </div>
          <button
            id="create-playlist-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-lg shadow-green-600/20"
          >
            <Plus size={18} /> New Playlist
          </button>
        </div>

        {/* Create dialog */}
        {showCreate && (
          <form onSubmit={createPlaylist} className="mb-8 glass-panel p-5 rounded-2xl flex gap-3 items-center border border-green-200 dark:border-green-800/50">
            <input
              autoFocus
              id="playlist-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-primary focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="p-2 text-secondary hover:text-primary transition"><X size={18} /></button>
          </form>
        )}

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
          </div>
        )}

        {!loading && playlists.length === 0 && !showCreate && (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <ListMusic size={56} className="text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-bold text-primary">No playlists yet</h2>
            <p className="text-secondary">Create a playlist and start adding books to it</p>
          </div>
        )}

        <div className="space-y-4">
          {playlists.map((pl) => (
            <Link to={`/playlists/${pl.id}`} key={pl.id} className="group flex items-center gap-4 glass-panel p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              {/* Book stack preview */}
              <div className="w-14 h-16 relative shrink-0">
                {pl.books?.slice(0, 3).reverse().map((b, i) => (
                  <div key={b.id} className={`absolute w-10 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800`} style={{ left: i * 8, zIndex: i }}>
                    {b.cover_image && <img src={b.cover_image} alt="" className="w-full h-full object-cover opacity-80" />}
                  </div>
                ))}
                {pl.books?.length === 0 && <div className="w-14 h-14 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-400"><ListMusic size={20} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-primary group-hover:text-green-600 transition truncate">{pl.name}</h3>
                <p className="text-sm text-secondary mt-0.5">{pl.books_count} {pl.books_count === 1 ? 'book' : 'books'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => deletePlaylist(pl.id, e)} className="p-2 text-secondary hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlists;
