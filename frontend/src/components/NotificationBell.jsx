import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('notifications/unread_count/');
      setUnreadCount(res.data.unread_count);
    } catch (_) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      setNotifications(res.data);
    } catch (_) {}
  };

  const togglePanel = () => {
    if (!open) fetchNotifications();
    setOpen((prev) => !prev);
  };

  const markAllRead = async () => {
    await api.post('notifications/mark_all_read/');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (notif) => {
    if (!notif.is_read) {
      await api.post(`notifications/${notif.id}/mark_read/`);
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'book_uploaded': return '📚';
      case 'new_comment': return '💬';
      case 'new_like': return '❤️';
      case 'new_follower': return '👤';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={togglePanel}
        id="notification-bell-btn"
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-secondary"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-primary text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                  <Check size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-secondary hover:text-primary">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-secondary text-sm py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.is_read ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                >
                  <span className="text-xl mt-0.5 shrink-0">{typeIcon(n.notif_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary leading-snug">{n.message}</p>
                    {n.book && (
                      <Link to={`/book/${n.book}`} className="text-xs text-green-600 hover:underline mt-0.5 block truncate">
                        View book
                      </Link>
                    )}
                    <span className="text-xs text-secondary mt-0.5 block">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
