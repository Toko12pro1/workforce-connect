import { supabase } from "../supabaseClient.js";

export async function followUser(followerId, followedId, followedType = "worker") {
  try {
    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, followed_id: followedId, followed_type: followedType }]);
    if (error && error.code !== "23505") throw error; // ignore duplicate
    return true;
  } catch {
    return false;
  }
}

export async function unfollowUser(followerId, followedId) {
  try {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("followed_id", followedId);
    return true;
  } catch {
    return false;
  }
}

export async function isFollowing(followerId, followedId) {
  try {
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("followed_id", followedId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getFollowers(userId) {
  try {
    const { data } = await supabase
      .from("follows")
      .select(`follower:profiles!follower_id(id, name, avatar_url, trade)`)
      .eq("followed_id", userId);
    return (data ?? []).map((r) => r.follower);
  } catch {
    return [];
  }
}
