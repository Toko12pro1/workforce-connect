import { supabase } from "../supabaseClient.js";

/** @typedef {{ id: string, name: string, email: string, phone?: string, avatarUrl?: string, role: string, location?: string, trade?: string, isAvailable: boolean, rating: string, jobsDone: number }} Profile */

/**
 * Fetch a user's profile.
 * @param {string} userId
 * @returns {Promise<Profile|null>}
 */
export async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, phone, avatar_url, role, location, trade, is_available, rating, jobs_done")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      role: data.role,
      location: data.location,
      trade: data.trade,
      isAvailable: data.is_available,
      rating: String(data.rating ?? "New"),
      jobsDone: data.jobs_done ?? 0
    };
  } catch {
    return null;
  }
}

/**
 * Update a user's profile fields.
 * @param {string} userId
 * @param {Partial<Profile>} updates
 * @returns {Promise<Profile|null>}
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        location: updates.location,
        trade: updates.trade,
        is_available: updates.isAvailable
      })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

/**
 * Create or update a profile (used after signUp).
 * @param {string} userId
 * @param {{ name: string, email: string, trade?: string, location?: string }} profileData
 * @returns {Promise<Profile|null>}
 */
export async function upsertProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...profileData })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

/**
 * Toggle a worker's availability status.
 * @param {string} userId
 * @param {boolean} isAvailable
 * @returns {Promise<void>}
 */
export async function setAvailability(userId, isAvailable) {
  try {
    await supabase
      .from("profiles")
      .update({ is_available: isAvailable })
      .eq("id", userId);
  } catch {
    // ignore — UI can still toggle optimistically
  }
}

export async function setAccountType(userId, type) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = {
    id: userId,
    account_type: type
  };
  if (user?.email) profile.email = user.email;
  if (user?.user_metadata?.name) profile.name = user.user_metadata.name;

  const { error } = await supabase
    .from("profiles")
    .upsert(profile);
  if (error) throw error;

  const { error: authError } = await supabase.auth.updateUser({
    data: { account_type: type }
  });
  if (authError) throw authError;
}

export async function updateSkills(userId, skills) {
  try {
    await supabase.from("profiles").update({ skills }).eq("id", userId);
  } catch {
    // best-effort
  }
}

export async function getProfileWithStats(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, phone, avatar_url, account_type, location, trade, is_available, rating, jobs_done, bio, skills, cv_url, followers_count, following_count, weekly_earnings")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}
