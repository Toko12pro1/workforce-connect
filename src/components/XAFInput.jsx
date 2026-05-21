import React from "react";

export default function XAFInput({ value, onChange, label = "Montant", placeholder = "35 000" }) {
  function handleChange(e) {
    const raw = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, "");
    onChange(raw ? parseInt(raw, 10) : 0);
  }

  const formatted = value ? new Intl.NumberFormat("fr-CM").format(value) : "";

  return (
    <label className="mock-form-field xaf-input-field">
      <span>{label}</span>
      <div className="xaf-input-wrapper">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={formatted}
          onChange={handleChange}
        />
        <span className="xaf-suffix">XAF</span>
      </div>
    </label>
  );
}
