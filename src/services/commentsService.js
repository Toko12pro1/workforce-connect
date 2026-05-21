import { supabase } from "../supabaseClient.js";
import { PostComment } from "../models/PostComment.js";

export async function getComments(postId) {
  try {
    const { data, error } = await supabase
      .from("post_comments")
      .select(`*, author:profiles(id, name, avatar_url)`)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => PostComment.fromRow(r));
  } catch {
    return [];
  }
}

export async function addComment(postId, authorId, text) {
  const { data, error } = await supabase
    .from("post_comments")
    .insert([{ post_id: postId, author_id: authorId, text }])
    .select(`*, author:profiles(id, name, avatar_url)`)
    .single();
  if (error) throw error;
  return PostComment.fromRow(data);
}

export async function deleteComment(id) {
  try {
    await supabase.from("post_comments").delete().eq("id", id);
  } catch {
    // best-effort
  }
}

export function subscribeToComments(postId, onComment) {
  return supabase
    .channel(`comments:${postId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` }, (payload) => onComment(PostComment.fromRow(payload.new)))
    .subscribe();
}
