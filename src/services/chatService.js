import { supabase } from "../supabaseClient.js";

/** @typedef {{ id: string, sender: 'user'|'provider', text?: string, image?: string, time: string, type?: string, status?: string }} ChatMessage */

function toChatMessage(row) {
  return {
    id: row.id,
    sender: row.sender_role,
    text: row.text,
    image: row.image_url,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: row.type,
    status: row.status
  };
}

/**
 * Fetch all messages for a job.
 * @param {string} jobId
 * @returns {Promise<ChatMessage[]>}
 */
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

/**
 * Send a message in a job chat.
 * @param {string} jobId
 * @param {{ senderId: string, senderRole: 'user'|'provider', text: string, imageUrl?: string }} payload
 * @returns {Promise<ChatMessage>}
 */
export async function sendMessage(jobId, { senderId, senderRole, text, imageUrl = null }) {
  if (!jobId) throw new Error("A job id is required to send a message.");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      job_id: jobId,
      sender_id: senderId,
      sender_role: senderRole,
      text,
      image_url: imageUrl
    })
    .select()
    .single();

  if (error) throw error;
  return toChatMessage(data);
}

/**
 * Subscribe to new messages in a job chat via Supabase Realtime.
 * @param {string} jobId
 * @param {(msg: ChatMessage) => void} onMessage
 * @returns {import('@supabase/supabase-js').RealtimeChannel}
 */
export function subscribeToMessages(jobId, onMessage) {
  return supabase
    .channel(`messages:job_id=eq.${jobId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `job_id=eq.${jobId}`
      },
      (payload) => onMessage(toChatMessage(payload.new))
    )
    .subscribe();
}
