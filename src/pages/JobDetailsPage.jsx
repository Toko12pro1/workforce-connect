import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, Info, Pencil, Search, X } from "lucide-react";
import { CAMEROON_TRADES } from "../components/TradeChipGrid.jsx";

const SERVICES = CAMEROON_TRADES;

export default function JobDetailsPage() {
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return q ? SERVICES.filter(s => s.toLowerCase().includes(q)) : SERVICES;
  }, [serviceSearch]);

  const canCustom = serviceSearch.trim() &&
    !SERVICES.some(s => s.toLowerCase() === serviceSearch.trim().toLowerCase());

  function handleNext() {
    if (!selectedService) { setError("Sélectionnez un service."); return; }
    if (!description.trim()) { setError("Décrivez le travail demandé."); return; }
    sessionStorage.setItem("job_draft", JSON.stringify({ serviceType: selectedService, description: description.trim() }));
    window.location.href = "/post-job-location";
  }

  return (
    <main className="app-screen job-details-screen">
      <header className="job-flow-header job-details-header">
        <a href="/browse" aria-label="Retour"><ArrowLeft size={28} /></a>
        <span className="job-flow-brand">Workforce Connect</span>
        <a href="/worker-dashboard" aria-label="Notifications"><Bell size={22} /></a>
      </header>

      <section className="job-details-content">
        <div className="job-step-row details-step">
          <strong>ÉTAPE 1 SUR 3</strong>
          <span>Détails du job</span>
        </div>

        <section className="details-intro">
          <h1>Publier un job</h1>
          <p>Décrivez votre besoin pour trouver le bon prestataire.</p>
          <h2>Quel service recherchez-vous ?</h2>
        </section>

        <label className="service-search-field">
          <Search size={24} />
          <input
            type="search"
            placeholder="Rechercher un service…"
            value={serviceSearch}
            onChange={e => setServiceSearch(e.target.value)}
          />
        </label>

        <div className="service-choice-grid">
          {filtered.map(name => (
            <button
              className={selectedService === name ? "active" : ""}
              key={name}
              type="button"
              onClick={() => setSelectedService(name)}
            >
              <span style={{ fontSize: "1.4rem" }}>🔧</span>
              <span>{name}</span>
            </button>
          ))}
          {canCustom && (
            <button
              className={selectedService === serviceSearch.trim() ? "active" : ""}
              type="button"
              onClick={() => setSelectedService(serviceSearch.trim())}
            >
              <Pencil size={28} />
              <span>Utiliser "{serviceSearch.trim()}"</span>
            </button>
          )}
        </div>

        <label className="job-description-field">
          <span>Décrivez le travail</span>
          <textarea
            maxLength={500}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="ex: Mon évier de cuisine fuit au niveau du siphon. J'ai besoin d'une intervention urgente…"
            rows={4}
          />
          <b>{description.length} / 500</b>
        </label>

        <p className="specific-tip"><Info size={22} /> Soyez précis pour obtenir de meilleures réponses.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <footer className="details-next-footer">
        <button className="wide-blue-button" type="button" onClick={handleNext}>
          Suivant : Lieu & Budget <ArrowRight size={26} />
        </button>
      </footer>
    </main>
  );
}
