import React, { useState } from "react";
import { Briefcase, Building2, User } from "lucide-react";
import { setAccountType } from "../services/profileService.js";
import { useAuth } from "../hooks/useAuth.js";

const ROLES = [
  {
    value: "worker",
    icon: <Briefcase size={36} />,
    title: "Travailleur",
    description: "Je propose mes compétences et services. Je publie mon travail, postule aux stages, et me fais découvrir."
  },
  {
    value: "client",
    icon: <User size={36} />,
    title: "Client",
    description: "Je cherche un prestataire ou artisan. Je publie une demande et reçois des offres."
  },
  {
    value: "sme",
    icon: <Building2 size={36} />,
    title: "PME / Entreprise",
    description: "Je représente une entreprise. Je publie des offres de stage et recrute des talents locaux."
  }
];

export default function RoleSelectPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!selected || !user) return;
    setError("");
    setSubmitting(true);
    try {
      await setAccountType(user.id, selected);
    } catch {
      setError("Impossible d'enregistrer ce choix. Verifiez Supabase puis reessayez.");
      setSubmitting(false);
      return;
    }

    if (selected === "sme") {
      window.location.href = "/sme-setup";
    } else if (selected === "worker") {
      window.location.href = "/worker-onboarding";
    } else {
      window.location.href = "/feed";
    }
  }

  return (
    <main className="app-screen role-select-screen">
      <div className="role-select-container">
        <h1>Bienvenue sur Workforce Connect</h1>
        <p>Comment souhaitez-vous utiliser l'application ?</p>
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="role-cards">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              className={`role-card${selected === role.value ? " active" : ""}`}
              onClick={() => setSelected(role.value)}
            >
              <span className="role-icon">{role.icon}</span>
              <strong>{role.title}</strong>
              <p>{role.description}</p>
            </button>
          ))}
        </div>

        <button
          className="wide-blue-button"
          type="button"
          disabled={!selected || submitting}
          onClick={handleContinue}
        >
          {submitting ? "Chargement…" : "Continuer"}
        </button>
      </div>
    </main>
  );
}
