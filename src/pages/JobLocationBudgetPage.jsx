import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Info, MapPin, Wallet, X } from "lucide-react";

const NEIGHBOURHOODS = [
  "Bastos","Biyem-Assi","Mfoundi","Nlongkak","Ekoudou","Essos","Mendong",
  "Santa Barbara","Mvog-Ada","Omnisports","Akwa","Bonanjo","Bali","Makepe",
  "Logbessou","Kotto","Ndokoti","Deido","New Bell","Bonabéri"
];

const BUDGET_TYPES = [
  { value: "fixed",      label: "Prix fixe",       desc: "Montant défini à l'avance" },
  { value: "negotiable", label: "Négociable",       desc: "Discuter le prix après" },
  { value: "cash",       label: "Espèces sur place", desc: "Payer en personne" }
];

export default function JobLocationBudgetPage() {
  const [location, setLocation] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function handleNext() {
    if (!location.trim()) { setError("Indiquez le quartier ou l'adresse."); return; }
    const draft = JSON.parse(sessionStorage.getItem("job_draft") || "{}");
    sessionStorage.setItem("job_draft", JSON.stringify({
      ...draft,
      location: location.trim(),
      budgetType,
      budgetAmount: amount ? parseInt(amount.replace(/\s/g, ""), 10) : 0
    }));
    window.location.href = "/post-job-visuals";
  }

  return (
    <main className="app-screen job-location-screen">
      <header className="job-flow-header">
        <a href="/post-job-details" aria-label="Retour"><X size={25} /></a>
        <span className="job-flow-brand">Workforce Connect</span>
      </header>

      <section className="job-flow-content">
        <div className="job-step-row">
          <strong>ÉTAPE 2 SUR 3</strong>
          <span>Lieu & Budget</span>
        </div>

        <section className="job-block">
          <h1>Où se passe le travail ?</h1>
          <label className="job-search-field">
            <span>Quartier ou adresse (Yaoundé / Douala)</span>
            <i>
              <MapPin size={22} />
              <input
                list="neighbourhoods"
                placeholder="ex: Bastos, Biyem-Assi, Bonanjo…"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <datalist id="neighbourhoods">
                {NEIGHBOURHOODS.map(n => <option key={n} value={n} />)}
              </datalist>
            </i>
          </label>
        </section>

        <section className="job-block">
          <h1>Définissez votre budget</h1>
          {BUDGET_TYPES.map(bt => (
            <article
              key={bt.value}
              className={`budget-option${budgetType === bt.value ? " active" : ""}`}
              onClick={() => setBudgetType(bt.value)}
              style={{ cursor: "pointer" }}
            >
              <span><Wallet size={26} /></span>
              <div>
                <h2>{bt.label}</h2>
                <p>{bt.desc}</p>
              </div>
              <b>{budgetType === bt.value ? "✓" : ""}</b>
            </article>
          ))}

          {budgetType === "fixed" && (
            <label className="amount-card">
              <span>Montant estimé (XAF)</span>
              <i>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6b7a99" }}>XAF</span>
                <input
                  placeholder="0"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9\s]/g, ""))}
                />
              </i>
            </label>
          )}

          <aside className="budget-tip">
            <Info size={22} />
            <p>La plupart des travaux à Yaoundé/Douala sont entre 10 000 et 150 000 XAF.</p>
          </aside>
        </section>

        {error && <p className="form-error" role="alert" style={{ margin: "0 16px" }}>{error}</p>}
      </section>

      <footer className="job-flow-actions">
        <a href="/post-job-details"><ArrowLeft size={22} /> Retour</a>
        <button type="button" className="wide-blue-button" style={{ flex: 1, maxWidth: 220 }} onClick={handleNext}>
          Suivant : Photos <ArrowRight size={22} />
        </button>
      </footer>
    </main>
  );
}
