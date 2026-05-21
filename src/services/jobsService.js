import { supabase } from "../supabaseClient.js";

/** @typedef {{ id: string, clientId: string, workerId?: string, serviceType: string, description: string, location: string, budgetType: 'fixed'|'negotiable'|'cash', budgetAmount?: number, status: string, mediaUrls: string[], createdAt: string }} Job */

function toJob(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    workerId: row.worker_id,
    serviceType: row.service_type,
    description: row.description,
    location: row.location,
    budgetType: row.budget_type,
    budgetAmount: row.budget_amount,
    status: row.status,
    mediaUrls: row.media_urls || [],
    createdAt: row.created_at
  };
}

/**
 * Create a new job posting in Supabase.
 * @param {{ clientId: string, serviceType: string, description: string, location: string, budgetType: string, budgetAmount?: number, mediaUrls?: string[] }} jobData
 * @returns {Promise<Job>}
 */
export async function createJob(jobData) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      client_id: jobData.clientId,
      service_type: jobData.serviceType,
      description: jobData.description,
      location: jobData.location,
      budget_type: jobData.budgetType || "negotiable",
      budget_amount: jobData.budgetAmount ?? null,
      status: "posted",
      media_urls: jobData.mediaUrls || []
    })
    .select()
    .single();

  if (error) throw error;
  return toJob(data);
}

/**
 * Fetch jobs for a user.
 * @param {string} userId
 * @returns {Promise<Job[]>}
 */
export async function getJobs(userId) {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toJob);
  } catch {
    return [];
  }
}

/**
 * Update a job's status or worker assignment.
 * @param {string} jobId
 * @param {{ status?: string, workerId?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateJob(jobId, updates) {
  const { error } = await supabase
    .from("jobs")
    .update({
      status: updates.status,
      worker_id: updates.workerId
    })
    .eq("id", jobId);
  if (error) throw error;
}
