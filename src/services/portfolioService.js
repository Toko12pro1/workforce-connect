import { supabase } from "../supabaseClient.js";

/** @typedef {{ id: string, title: string, caption: string, category: string, postType: string, image: string|null, mediaLabel: string, createdAt: string, author: { name: string, service: string, location: string, rating: string, avatar: string } }} PortfolioPost */

function toPortfolioPost(row, author = null) {
  const worker = row.worker ?? author ?? {};
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    category: row.category,
    postType: row.post_type,
    image: row.media_urls?.[0] ?? null,
    mediaLabel: row.media_label,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : "Just now",
    author: {
      name: worker.name ?? "",
      service: worker.trade ?? worker.service ?? "",
      location: worker.location ?? "",
      rating: String(worker.rating ?? "New"),
      avatar: worker.avatar_url ?? worker.avatar ?? ""
    }
  };
}

/**
 * Fetch portfolio posts, optionally for a specific worker.
 * @param {string|null} workerId
 * @returns {Promise<PortfolioPost[]>}
 */
export async function getPosts(workerId = null) {
  try {
    let query = supabase
      .from("portfolio_posts")
      .select(
        "id, title, caption, category, post_type, media_urls, media_label, created_at, worker:profiles(name, trade, location, rating, avatar_url)"
      )
      .order("created_at", { ascending: false });

    if (workerId) query = query.eq("worker_id", workerId);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((post) => toPortfolioPost(post));
  } catch {
    return [];
  }
}

/**
 * Create a new portfolio post in Supabase.
 * @param {{ title: string, caption: string, category: string, postType: string, workerId?: string, author: object, image?: string }} postData
 * @param {File[]} mediaFiles
 * @returns {Promise<PortfolioPost>}
 */
export async function createPost(postData, mediaFiles = []) {
  const mediaLabel = mediaFiles.length
    ? `${mediaFiles.length} ${mediaFiles.length === 1 ? "item" : "items"}`
    : (postData.mediaLabel || "Photo");

  const { data, error } = await supabase
    .from("portfolio_posts")
    .insert({
      title: postData.title,
      caption: postData.caption,
      category: postData.category,
      post_type: postData.postType,
      media_urls: postData.image ? [postData.image] : [],
      media_label: mediaLabel,
      worker_id: postData.workerId ?? null
    })
    .select()
    .single();

  if (error) throw error;
  return toPortfolioPost(data, postData.author);
}
