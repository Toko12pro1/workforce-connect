import React, { useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import TradeChipGrid from "../components/TradeChipGrid.jsx";
import { updateProfile } from "../services/profileService.js";
import { useAuth } from "../hooks/useAuth.js";

const LOCATIONS = [
  "Bastos, Yaoundé","Biyem-Assi, Yaoundé","Mfoundi, Yaoundé","Nlongkak, Yaoundé",
  "Mendong, Yaoundé","Ekoudou, Yaoundé","Essos, Yaoundé","Omnisports, Yaoundé",
  "Akwa, Douala","Bonanjo, Douala","Bali, Douala","Makepe, Douala",
  "Logbessou, Douala","Kotto, Douala","Ndokoti, Douala","Bonabéri, Douala",
  "Centre-Ville, Bafoussam","Centre-Ville, Garoua","Centre-Ville, Maroua"
];

export default function WorkerOnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [trade, setTrade] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    if (!user?.id) { window.location.href = "/login"; return; }
    setSaving(true);
    setError("");
    try {
      await updateProfile(user.id, {
        phone: phone ? `+237${phone.replace(/\s/g, "")}` : undefined,
        trade: trade || undefined,
        location: location || undefined,
        isAvailable: true
      });
      window.location.href = "/worker-dashboard";
    } catch {
      setError("Impossible de sauvegarder. Réessayez.");
      setSaving(false);
    }
  }

  return (
    <main className="setup-screen">
      <header className="setup-header">
        <a href="/">Workforce Connect</a>
        <span>Étape {step} sur 3</span>
      </header>

      <section className="setup-content">
        <article className="setup-hero">
          <img
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=82"
            alt="Travailleurs"
          />
          <div>
            <h1>Bienvenue sur Workforce Connect</h1>
            <p>Configurez votre profil et commencez à recevoir des demandes.</p>
          </div>
        </article>

        {step === 1 && (
          <section className="setup-block">
            <h2>Votre numéro de téléphone</h2>
            <div className="phone-entry">
              <button type="button" style={{ fontWeight: 700, minWidth: 56 }}>+237</button>
              <input
                placeholder="6XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                inputMode="tel"
                maxLength={12}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
              Numéro Cameroun. Les clients vous appelleront sur ce numéro.
            </p>
            <button className="wide-blue-button" onClick={() => setStep(2)}>
              Suivant <ArrowRight size={20} />
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="setup-block">
            <h2>Votre métier</h2>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 12 }}>
              Sélectionnez votre spécialité principale.
            </p>
            <TradeChipGrid selected={trade} onChange={setTrade} />
            <button
              className="wide-blue-button"
              style={{ marginTop: 16 }}
              onClick={() => setStep(3)}
              disabled={!trade}
            >
              Suivant <ArrowRight size={20} />
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="setup-block">
            <h2>Votre zone de travail</h2>
            <label className="manual-location" style={{ marginBottom: 16 }}>
              <MapPin size={20} />
              <input
                list="worker-areas"
                placeholder="ex: Bastos, Yaoundé"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <datalist id="worker-areas">
                {LOCATIONS.map(l => <option key={l} value={l} />)}
              </datalist>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button
              className="wide-blue-button"
              onClick={finish}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : <><CheckCircle2 size={20} /> Terminer la configuration</>}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
