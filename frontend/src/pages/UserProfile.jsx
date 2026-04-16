import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { BookOpen, Heart, Star, UserCheck, UserPlus, Upload, MessageSquare } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const isMe = localStorage.getItem('user_id') === userId;

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`profiles/${userId}/`);
      setProfile(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.get(`profiles/${userId}/activity/`);
      setActivity(res.data.recent_comments || []);
    } catch (_) {}
  };

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await api.post(`profiles/${userId}/follow/`);
      setProfile((prev) => ({
        ...prev,
        is_following: res.data.is_following,
        followers_count: res.data.is_following ? prev.followers_count + 1 : prev.followers_count - 1
      }));
    } catch (_) {}
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-40 bg-primary min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20 min-h-screen text-secondary text-xl">User not found</div>
  );

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      {/* Profile Header */}
      <div className="bg-secondary border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-green-600/20 shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-primary">@{profile.username}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-3 text-sm text-secondary">
                <span><strong className="text-primary">{profile.uploaded_books?.length}</strong> books</span>
                <span><strong className="text-primary">{profile.followers_count}</strong> followers</span>
                <span><strong className="text-primary">{profile.following_count}</strong> following</span>
              </div>
              {!isMe && localStorage.getItem('access_token') && (
                <button
                  id="follow-btn"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition shadow-md disabled:opacity-60 ${
                    profile.is_following
                      ? 'bg-gray-200 dark:bg-gray-700 text-primary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'
                  }`}
                >
                  {profile.is_following ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Uploaded Books */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Upload size={20} className="text-green-600" /> Uploaded Books
          </h2>
          {profile.uploaded_books?.length === 0 ? (
            <p className="text-secondary py-8 text-center glass-panel rounded-2xl">No books uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {profile.uploaded_books?.map((book) => (
                <Link to={`/book/${book.id}`} key={book.id} className="group flex gap-4 glass-panel p-4 rounded-2xl hover:shadow-lg transition hover:-translate-y-0.5">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                    {book.cover_image ? <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-gray-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary truncate group-hover:text-green-600 transition">{book.title}</h3>
                    <p className="text-sm text-secondary">{book.author}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary">
                      <span className="flex items-center gap-1"><Heart size={11} className="text-red-400" />{book.likes_count}</span>
                      {book.avg_rating > 0 && <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{book.avg_rating}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" /> Recent Activity
          </h2>
          {activity.length === 0 ? (
            <p className="text-secondary text-sm glass-panel p-4 rounded-2xl text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.map((comment) => (
                <div key={comment.id} className="glass-panel p-4 rounded-2xl">
                  <p className="text-sm text-primary line-clamp-2">"{comment.text}"</p>
                  <Link to={`/book/${comment.book}`} className="text-xs text-green-600 hover:underline mt-1 block">View book →</Link>
                  <span className="text-xs text-secondary">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
