import { supabase } from "../supabaseClient.js";
import { Notification } from "../models/Notification.js";

export async function getNotifications(userId, { unreadOnly = false } = {}) {
  try {
    let q = supabase
      .from("notifications")
      .select(`*, actor:profiles!actor_id(id, name, avatar_url)`)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) q = q.eq("is_read", false);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => Notification.fromRow(r));
  } catch {
    return [];
  }
}

export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markAllRead(userId) {
  try {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);
  } catch {
    // best-effort
  }
}

export async function markOneRead(id) {
  try {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  } catch {
    // best-effort
  }
}

export function subscribeToNotifications(userId, onNotification) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
      (payload) => onNotification(Notification.fromRow(payload.new))
    )
    .subscribe();
}
