import { supabase } from "../supabaseClient.js";
import { SMEProfile } from "../models/SMEProfile.js";
import { uploadSMELogo } from "./storageService.js";

export async function getSMEProfile(smeId) {
  try {
    const { data, error } = await supabase
      .from("sme_profiles")
      .select(`*, profile:profiles(name, email, phone, location)`)
      .eq("id", smeId)
      .single();
    if (error) throw error;
    return SMEProfile.fromRow({ ...data.profile, ...data });
  } catch {
    return null;
  }
}

export async function createSMEProfile(userId, profileData) {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ account_type: "sme" })
    .eq("id", userId);
  if (profileError) throw profileError;

  const { data, error } = await supabase
    .from("sme_profiles")
    .insert([{ id: userId, ...profileData }])
    .select()
    .single();
  if (error) throw error;
  return SMEProfile.fromRow(data);
}

export async function updateSMEProfile(id, updates) {
  try {
    const { data, error } = await supabase
      .from("sme_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return SMEProfile.fromRow(data);
  } catch {
    return null;
  }
}

export async function uploadSMELogoAndSave(smeId, file) {
  const url = await uploadSMELogo(file, smeId);
  await updateSMEProfile(smeId, { logo_url: url });
  return url;
}
