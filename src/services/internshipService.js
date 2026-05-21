import { supabase } from "../supabaseClient.js";
import { InternshipOffer } from "../models/InternshipOffer.js";

export async function getOffers({ trade, city, compensationType, page = 0 } = {}) {
  try {
    let query = supabase
      .from("internship_offers")
      .select(`*, sme:sme_profiles(company_name, logo_url, city)`)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .range(page * 12, page * 12 + 11);

    if (trade) query = query.eq("trade", trade);
    if (city) query = query.eq("city", city);
    if (compensationType) query = query.eq("compensation_type", compensationType);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => InternshipOffer.fromRow(row));
  } catch {
    return [];
  }
}

export async function getOfferById(id) {
  try {
    const { data, error } = await supabase
      .from("internship_offers")
      .select(`*, sme:sme_profiles(company_name, logo_url, city, sector)`)
      .eq("id", id)
      .single();
    if (error) throw error;
    return InternshipOffer.fromRow(data);
  } catch {
    return null;
  }
}

export async function createOffer(smeId, offerData) {
  const { data, error } = await supabase
    .from("internship_offers")
    .insert([{ ...offerData, sme_id: smeId }])
    .select()
    .single();
  if (error) throw error;
  return InternshipOffer.fromRow(data);
}

export async function closeOffer(id) {
  const { error } = await supabase
    .from("internship_offers")
    .update({ status: "closed" })
    .eq("id", id);
  if (error) throw error;
}

export async function getOffersBySME(smeId) {
  try {
    const { data, error } = await supabase
      .from("internship_offers")
      .select("*")
      .eq("sme_id", smeId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => InternshipOffer.fromRow(row));
  } catch {
    return [];
  }
}
