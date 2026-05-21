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
    .channel(`messages:job_id=eq.${jobId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${jobId}` },
      (payload) => onMessage(toChatMessage(payload.new)))
    .subscribe();
}

// Find an existing direct thread between two users, or create one
export async function getOrCreateDirectThread(myId, theirId) {
  try {
    // Look for an existing contact thread between these two users
    const { data: existing } = await supabase
      .from("jobs")
      .select("id")
      .eq("service_type", "Message direct")
      .or(`and(client_id.eq.${myId},worker_id.eq.${theirId}),and(client_id.eq.${theirId},worker_id.eq.${myId})`)
      .limit(1)
      .maybeSingle();

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
        budget_currency: "XAF",
        status: "active"
      })
      .select("id")
      .single();

    if (error) throw error;
    return newJob.id;
  } catch {
    return null;
  }
}

// Get all chat threads for the current user (jobs where they are client or worker)
export async function getMyThreads(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
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
    return data ?? [];
  } catch {
    return [];
  }
}
