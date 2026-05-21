import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadCount, subscribeToNotifications } from "../services/notificationService.js";

export default function NotificationBell({ userId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    getUnreadCount(userId).then(setCount);

    const channel = subscribeToNotifications(userId, () => {
      setCount((c) => c + 1);
    });
    return () => channel.unsubscribe();
  }, [userId]);

  return (
    <a href="/notifications" className="notif-bell" aria-label={`Notifications${count > 0 ? ` (${count} non lues)` : ""}`}>
      <Bell size={22} />
      {count > 0 && <span className="notif-badge">{count > 99 ? "99+" : count}</span>}
    </a>
  );
}
