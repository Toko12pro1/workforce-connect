import React, { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { createSMEProfile } from "../services/smeService.js";
import { useAuth } from "../hooks/useAuth.js";

const SECTORS = ["BTP / Construction", "Industrie", "Commerce", "Services", "Agroalimentaire", "Technologie", "Éducation", "Santé", "Transport", "Artisanat"];
const CITIES = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua", "Bertoua", "Ebolowa", "Limbe"];

export default function SMEOnboardingPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("micro");
  const [city, setCity] = useState("Yaoundé");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { setError("Vous devez être connecté."); return; }
    setError("");
    setSubmitting(true);
    try {
      await createSMEProfile(user.id, { company_name: companyName, sector, size, city });
      window.location.href = "/sme-portal";
    } catch {
      setError("Impossible de creer le profil PME. Verifiez Supabase puis reessayez.");
      setSubmitting(false);
    }
  }

  return (
    <main className="app-screen portfolio-upload-screen">
      <header className="portfolio-upload-header">
        <a href="/role-select" aria-label="Retour">
          <ArrowLeft size={28} />
        </a>
        <h1>Créer votre profil PME</h1>
        <span />
      </header>

      <form className="portfolio-upload-content" onSubmit={handleSubmit}>
        <div className="sme-onboard-icon">
          <Building2 size={48} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <label className="mock-form-field">
          <span>Nom de l'entreprise</span>
          <input required placeholder="ex: BTP Akwa SARL" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>

        <label className="mock-form-field">
          <span>Secteur d'activité</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)} required>
            <option value="">— Choisir —</option>
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>

        <section className="chip-section">
          <h2>Taille de l'entreprise</h2>
          <div>
            {[["micro", "Micro (1–9)"], ["petite", "Petite (10–49)"], ["moyenne", "Moyenne (50–249)"]].map(([val, lbl]) => (
              <button key={val} type="button" className={size === val ? "active" : ""} onClick={() => setSize(val)}>
                {lbl}
              </button>
            ))}
          </div>
        </section>

        <label className="mock-form-field">
          <span>Ville principale</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <button className="wide-blue-button" type="submit" disabled={submitting}>
          {submitting ? "Création…" : "Créer le profil PME"}
        </button>
      </form>
    </main>
  );
}
