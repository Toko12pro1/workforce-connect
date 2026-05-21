import { supabase } from "../supabaseClient.js";

/**
 * Upload a file to a Supabase Storage bucket.
 * @param {string} bucket  e.g. "portfolio-media"
 * @param {string} path    e.g. "userId/1234567890.jpg"
 * @param {File} file
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

/**
 * Upload a portfolio image or video.
 * Bucket: "portfolio-media"
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<string>} public URL
 */
export async function uploadPortfolioMedia(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  return uploadFile("portfolio-media", path, file);
}

/**
 * Upload a job photo or video.
 * Bucket: "job-media"
 * @param {File} file
 * @param {string} jobId
 * @returns {Promise<string>} public URL
 */
export async function uploadJobMedia(file, jobId) {
  const ext = file.name.split(".").pop();
  const path = `${jobId}/${Date.now()}.${ext}`;
  return uploadFile("job-media", path, file);
}

/**
 * Upload a user avatar.
 * Bucket: "avatars"
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<string>} public URL
 */
export async function uploadAvatar(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;
  return uploadFile("avatars", path, file);
}

export async function uploadFeedMedia(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  return uploadFile("feed-media", path, file);
}

export async function uploadCV(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/cv_${Date.now()}.${ext}`;
  return uploadFile("cv-uploads", path, file);
}

export async function uploadSMELogo(file, smeId) {
  const ext = file.name.split(".").pop();
  const path = `${smeId}/logo.${ext}`;
  return uploadFile("sme-logos", path, file);
}
