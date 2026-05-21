import { supabase } from "../supabaseClient.js";

export async function toggleLike(postId, userId) {
  try {
    const { data: existing } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("post_likes").delete().eq("id", existing.id);
      const { data } = await supabase
        .from("feed_posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      return { liked: false, newCount: data?.likes_count ?? 0 };
    } else {
      await supabase.from("post_likes").insert([{ post_id: postId, user_id: userId }]);
      const { data } = await supabase
        .from("feed_posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      return { liked: true, newCount: data?.likes_count ?? 0 };
    }
  } catch {
    return { liked: false, newCount: 0 };
  }
}

export async function getLikedPostIds(userId) {
  try {
    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);
    return (data ?? []).map((r) => r.post_id);
  } catch {
    return [];
  }
}

export function subscribeToLikes(postId, onUpdate) {
  return supabase
    .channel(`likes:${postId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "post_likes", filter: `post_id=eq.${postId}` }, onUpdate)
    .subscribe();
}
