import { supabase } from "../supabaseClient.js";
import { JobApplication } from "../models/JobApplication.js";
import { uploadCV } from "./storageService.js";

export async function applyToOffer(offerId, applicantId, { coverNote = "", cvFile = null } = {}) {
  let cvUrl = null;
  if (cvFile) {
    cvUrl = await uploadCV(cvFile, applicantId);
  }

  const { data, error } = await supabase
    .from("applications")
    .insert([{ offer_id: offerId, applicant_id: applicantId, cover_note: coverNote, cv_url: cvUrl }])
    .select()
    .single();
  if (error) throw error;
  return JobApplication.fromRow(data);
}

export async function getMyApplications(applicantId) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`*, offer:internship_offers(title, trade, city, duration, compensation_type, compensation_amount, sme:sme_profiles(company_name, logo_url))`)
      .eq("applicant_id", applicantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => JobApplication.fromRow(r));
  } catch {
    return [];
  }
}

export async function getApplicationsForOffer(offerId) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`*, applicant:profiles(id, name, avatar_url, trade, location, cv_url)`)
      .eq("offer_id", offerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => JobApplication.fromRow(r));
  } catch {
    return [];
  }
}

export async function updateApplicationStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return JobApplication.fromRow(data);
  } catch {
    return null;
  }
}
