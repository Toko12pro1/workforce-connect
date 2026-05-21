import React, { useState } from "react";
import TradeChipGrid from "./TradeChipGrid.jsx";
import XAFInput from "./XAFInput.jsx";

const CITIES = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua", "Bertoua", "Ebolowa", "Limbe"];

export default function OfferFormPanel({ initial = {}, onSave, onCancel }) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [trade, setTrade] = useState(initial.trade ?? "");
  const [city, setCity] = useState(initial.city ?? "Yaoundé");
  const [duration, setDuration] = useState(initial.duration ?? "");
  const [compType, setCompType] = useState(initial.compensationType ?? "unpaid");
  const [compAmount, setCompAmount] = useState(initial.compensationAmount ?? 0);
  const [deadline, setDeadline] = useState(initial.deadline?.toISOString?.().slice(0, 10) ?? "");

  function handleSave(e) {
    e.preventDefault();
    onSave({
      title,
      trade,
      city,
      duration,
      compensation_type: compType,
      compensation_amount: compType === "paid" ? compAmount : 0,
      deadline: deadline || null
    });
  }

  return (
    <form className="offer-form-panel" onSubmit={handleSave}>
      <label className="mock-form-field">
        <span>Titre de l'offre</span>
        <input required placeholder="ex: Stage maçonnerie gros œuvre" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <TradeChipGrid selected={trade} onChange={setTrade} label="Métier recherché" />

      <label className="mock-form-field">
        <span>Ville</span>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <label className="mock-form-field">
        <span>Durée du stage</span>
        <input placeholder="ex: 3 mois" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </label>

      <section className="chip-section">
        <h2>Rémunération</h2>
        <div>
          {[["unpaid", "Non rémunéré"], ["transport", "Transport"], ["paid", "Rémunéré (XAF)"]].map(([val, lbl]) => (
            <button key={val} type="button" className={compType === val ? "active" : ""} onClick={() => setCompType(val)}>
              {lbl}
            </button>
          ))}
        </div>
      </section>

      {compType === "paid" && (
        <XAFInput value={compAmount} onChange={setCompAmount} label="Montant mensuel" />
      )}

      <label className="mock-form-field">
        <span>Date limite</span>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Annuler</button>
        <button type="submit" className="wide-blue-button">Publier l'offre</button>
      </div>
    </form>
  );
}
