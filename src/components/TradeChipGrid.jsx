import React from "react";

export const CAMEROON_TRADES = [
  "Maçonnerie",
  "Plomberie",
  "Electricité",
  "Menuiserie",
  "Couture",
  "Coiffure",
  "Mécanique",
  "Soudure",
  "Peinture",
  "Carrelage",
  "Cuisine",
  "Informatique",
  "Climatisation",
  "Jardinage",
  "Agent de sécurité",
  "Transport"
];

export default function TradeChipGrid({ selected, onChange, trades = CAMEROON_TRADES, label = "Métier / Domaine" }) {
  return (
    <section className="chip-section" aria-labelledby="trade-chip-label">
      <h2 id="trade-chip-label">{label}</h2>
      <div>
        {trades.map((trade) => (
          <button
            key={trade}
            type="button"
            className={selected === trade ? "active" : ""}
            onClick={() => onChange(selected === trade ? "" : trade)}
          >
            {trade}
          </button>
        ))}
      </div>
    </section>
  );
}
