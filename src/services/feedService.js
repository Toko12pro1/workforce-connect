import { supabase } from "../supabaseClient.js";
import { FeedPost } from "../models/FeedPost.js";

export async function getFeed({ page = 0, trade, city, postType } = {}) {
  try {
    let query = supabase
      .from("feed_posts")
      .select(`*, author:profiles(id, name, trade, location, avatar_url)`)
      .order("created_at", { ascending: false })
      .range(page * 10, page * 10 + 9);

    if (trade) query = query.eq("category", trade);
    if (city) query = query.eq("city", city);
    if (postType) query = query.eq("post_type", postType);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => FeedPost.fromRow(row));
  } catch {
    return [];
  }
}

export async function getPostById(id) {
  try {
    const { data, error } = await supabase
      .from("feed_posts")
      .select(`*, author:profiles(id, name, trade, location, avatar_url)`)
      .eq("id", id)
      .single();
    if (error) throw error;
    return FeedPost.fromRow(data);
  } catch {
    return null;
  }
}

export async function createFeedPost(postData) {
  const { data, error } = await supabase
    .from("feed_posts")
    .insert([postData])
    .select()
    .single();
  if (error) throw error;
  return FeedPost.fromRow(data);
}

export async function incrementViews(postId) {
  try {
    await supabase.rpc("increment_views", { post_id: postId });
  } catch {
    // best-effort
  }
}
