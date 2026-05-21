import React, { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { getNotifications, markAllRead, markOneRead, subscribeToNotifications } from "../services/notificationService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getNotifications(user.id).then((data) => {
      setNotifications(data);
      setLoading(false);
    });

    const channel = subscribeToNotifications(user.id, (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });
    return () => channel.unsubscribe();
  }, [user?.id]);

  async function handleMarkAllRead() {
    await markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function handleMarkOne(id) {
    await markOneRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="app-screen notifications-screen">
      <AppHeader title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`} />

      {unreadCount > 0 && (
        <div className="notif-actions">
          <button type="button" className="text-btn" onClick={handleMarkAllRead}>
            <Check size={16} /> Tout marquer comme lu
          </button>
        </div>
      )}

      <section className="app-section">
        {loading ? (
          <div className="browse-loading">Chargement…</div>
        ) : notifications.length === 0 ? (
          <div className="browse-empty">
            <Bell size={32} />
            <p>Aucune notification pour l'instant.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <article
                key={notif.id}
                className={`notif-item${notif.isRead ? "" : " unread"}`}
                onClick={() => !notif.isRead && handleMarkOne(notif.id)}
              >
                <div className="notif-avatar">
                  {notif.actor?.avatar_url ? (
                    <img src={notif.actor.avatar_url} alt={notif.actor.name} />
                  ) : (
                    <span>{notif.actor?.name?.[0] ?? "?"}</span>
                  )}
                </div>
                <div className="notif-body">
                  <strong>{notif.actor?.name ?? "Quelqu'un"}</strong>
                  <span> {notif.actionLabel}</span>
                  <time>{new Date(notif.createdAt).toLocaleDateString("fr-CM")}</time>
                </div>
                {!notif.isRead && <span className="notif-dot" aria-label="Non lu" />}
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav active="notifications" mode="worker" />
    </main>
  );
}
