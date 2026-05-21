import { supabase } from "../supabaseClient.js";

function toWorker(row) {
  return {
    id: row.id,
    name: row.name,
    trade: row.trade ?? "",
    rating: String(row.rating ?? "New"),
    distance: "",
    isAvailable: row.is_available ?? true,
    location: row.location ?? "",
    avatarUrl:
      row.avatar_url ??
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=180&q=80",
    bio: row.bio ?? "",
    skills: row.skills ?? [],
    followersCount: row.followers_count ?? 0
  };
}

export async function getWorkers({ search = "", category = "All", availableOnly = false } = {}) {
  try {
    let query = supabase
      .from("profiles")
      .select("id, name, trade, is_available, location, avatar_url, rating, jobs_done")
      .eq("account_type", "worker");

    if (availableOnly) query = query.eq("is_available", true);
    if (search) query = query.or(`name.ilike.%${search}%,trade.ilike.%${search}%`);
    if (category && category !== "All") query = query.ilike("trade", `%${category}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toWorker);
  } catch {
    return [];
  }
}

export async function getWorkerById(id) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, trade, is_available, location, avatar_url, rating, jobs_done, bio, skills, followers_count")
      .eq("id", id)
      .single();
    if (error) throw error;
    return toWorker(data);
  } catch {
    return null;
  }
}
