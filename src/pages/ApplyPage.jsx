import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import { getOfferById } from "../services/internshipService.js";
import { applyToOffer } from "../services/applicationService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function ApplyPage() {
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const offerId = params.get("offerId");

  const [offer, setOffer] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (offerId) getOfferById(offerId).then(setOffer);
  }, [offerId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);
    try {
      await applyToOffer(offerId, user.id, { coverNote, cvFile });
      setDone(true);
    } catch {
      setError("Impossible d'envoyer la candidature. Veuillez reessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="app-screen apply-screen">
        <div className="success-state">
          <CheckCircle2 size={56} color="#17a34a" />
          <h2>Candidature envoyée !</h2>
          <p>L'entreprise examinera votre dossier et vous contactera.</p>
          <a href="/my-applications" className="wide-blue-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            Voir mes candidatures
          </a>
        </div>
        <BottomNav active="internships" mode="worker" />
      </main>
    );
  }

  return (
    <main className="app-screen apply-screen">
      <header className="portfolio-upload-header">
        <a href={offerId ? `/internship/${offerId}` : "/internships"} aria-label="Retour">
          <ArrowLeft size={28} />
        </a>
        <h1>Postuler</h1>
        <span />
      </header>

      {offer && (
        <div className="apply-offer-summary">
          <strong>{offer.title}</strong>
          <span>{offer.sme?.company_name} • {offer.city}</span>
          <span className={`internship-badge ${offer.compensationType}`}>{offer.compensationLabel}</span>
        </div>
      )}

      <form className="portfolio-upload-content" onSubmit={handleSubmit}>
        <label className="mock-form-field post-caption-field">
          <span>Lettre de motivation</span>
          <textarea
            placeholder="Bonjour, je suis intéressé(e) par ce stage car…"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            rows={5}
          />
        </label>

        <label className="mock-form-field">
          <span>CV (PDF ou Word) — optionnel</span>
          <div className="file-pick-row">
            <FileText size={20} />
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
            {cvFile && <span>{cvFile.name}</span>}
          </div>
        </label>

        <button className="wide-blue-button" type="submit" disabled={submitting || !user}>
          {submitting ? "Envoi…" : "Envoyer ma candidature"}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!user && <p className="form-error">Connectez-vous pour postuler.</p>}
      </form>

      <BottomNav active="internships" mode="worker" />
    </main>
  );
}
