import { supabase } from "../supabaseClient.js";

function toChatMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    sender: row.sender_role,
    text: row.text,
    image: row.image_url,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: row.type,
    status: row.status
  };
}

export async function getMessages(jobId) {
  if (!jobId) return [];
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, sender_role, text, image_url, type, status, created_at")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toChatMessage);
  } catch {
    return [];
  }
}

export async function sendMessage(jobId, { senderId, senderRole, text, imageUrl = null }) {
  if (!jobId) throw new Error("jobId required");
  const { data, error } = await supabase
    .from("messages")
    .insert({ job_id: jobId, sender_id: senderId, sender_role: senderRole, text, image_url: imageUrl })
    .select()
    .single();
  if (error) throw error;
  return toChatMessage(data);
}

export function subscribeToMessages(jobId, onMessage) {
  return supabase
    .channel(`messages:${jobId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${jobId}` },
      (payload) => onMessage(toChatMessage(payload.new))
    )
    .subscribe();
}

// Mark messages in a thread as read (uses localStorage timestamp per user)
export function markThreadRead(userId) {
  if (!userId) return;
  localStorage.setItem(`chat_last_read_${userId}`, new Date().toISOString());
}

// Count messages received since user last opened chat
export async function getUnreadMessageCount(userId) {
  if (!userId) return 0;
  try {
    const lastRead = localStorage.getItem(`chat_last_read_${userId}`) || new Date(0).toISOString();
    const { data: threads } = await supabase
      .from("jobs")
      .select("id")
      .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
      .not("worker_id", "is", null);
    if (!threads?.length) return 0;
    const ids = threads.map(t => t.id);
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("job_id", ids)
      .neq("sender_id", userId)
      .gt("created_at", lastRead);
    return count ?? 0;
  } catch {
    return 0;
  }
}

// Find an existing direct thread between two users, or create one
export async function getOrCreateDirectThread(myId, theirId) {
  if (!myId || !theirId) return null;

  // Two simple queries instead of complex OR filter (more reliable)
  const [{ data: asClient }, { data: asWorker }] = await Promise.all([
    supabase.from("jobs").select("id").eq("service_type", "Message direct").eq("client_id", myId).eq("worker_id", theirId).limit(1),
    supabase.from("jobs").select("id").eq("service_type", "Message direct").eq("client_id", theirId).eq("worker_id", myId).limit(1)
  ]);

  const existing = asClient?.[0] ?? asWorker?.[0];
  if (existing?.id) return existing.id;

  // Create new thread
  const { data: newJob, error } = await supabase
    .from("jobs")
    .insert({
      client_id: myId,
      worker_id: theirId,
      service_type: "Message direct",
      description: "Discussion directe",
      location: "—",
      budget_type: "fixed",
      budget_amount: 0,
      status: "posted",
      media_urls: []
    })
    .select("id")
    .single();

  if (error) {
    console.error("getOrCreateDirectThread:", error.message, error.code, error.hint, error.details);
    throw new Error(error.message || "Insert failed");
  }
  return newJob.id;
}

// Get all chat threads for the user, with last message preview and unread count
export async function getMyThreads(userId) {
  if (!userId) return [];
  try {
    const { data: threads, error } = await supabase
      .from("jobs")
      .select(`
        id, service_type, status, created_at,
        client:profiles!jobs_client_id_fkey(id, name, avatar_url),
        worker:profiles!jobs_worker_id_fkey(id, name, avatar_url)
      `)
      .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
      .not("worker_id", "is", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!threads?.length) return [];

    const ids = threads.map(t => t.id);

    // Last message per thread
    const { data: msgs } = await supabase
      .from("messages")
      .select("job_id, text, sender_id, created_at")
      .in("job_id", ids)
      .order("created_at", { ascending: false });

    const lastByThread = {};
    for (const m of (msgs ?? [])) {
      if (!lastByThread[m.job_id]) lastByThread[m.job_id] = m;
    }

    // Unread count: messages from others since last read timestamp
    const lastRead = localStorage.getItem(`chat_last_read_${userId}`) || new Date(0).toISOString();
    const { data: unreadMsgs } = await supabase
      .from("messages")
      .select("job_id")
      .in("job_id", ids)
      .neq("sender_id", userId)
      .gt("created_at", lastRead);

    const unreadByThread = {};
    for (const m of (unreadMsgs ?? [])) {
      unreadByThread[m.job_id] = (unreadByThread[m.job_id] ?? 0) + 1;
    }

    return threads
      .map(t => ({
        ...t,
        lastMessage: lastByThread[t.id] ?? null,
        unreadCount: unreadByThread[t.id] ?? 0
      }))
      .sort((a, b) => {
        const at = new Date(a.lastMessage?.created_at ?? a.created_at);
        const bt = new Date(b.lastMessage?.created_at ?? b.created_at);
        return bt - at;
      });
  } catch {
    return [];
  }
}
