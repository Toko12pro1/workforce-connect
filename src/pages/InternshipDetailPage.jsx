import React, { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Calendar, Clock, MapPin } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import { getOfferById } from "../services/internshipService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function InternshipDetailPage({ id }) {
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    if (id) getOfferById(id).then(setOffer);
  }, [id]);

  if (!offer) {
    return <main className="app-screen"><div className="browse-loading">Chargement…</div></main>;
  }

  return (
    <main className="app-screen internship-detail-screen">
      <header className="portfolio-upload-header">
        <a href="/internships" aria-label="Retour">
          <ArrowLeft size={28} />
        </a>
        <h1>Détail de l'offre</h1>
        <span />
      </header>

      <div className="internship-detail-body">
        <div className="internship-card">
          <header>
            <div className="sme-logo-placeholder">
              <BriefcaseBusiness size={24} />
            </div>
            <div>
              <strong>{offer.sme?.company_name ?? "Entreprise"}</strong>
              <span><MapPin size={12} />{offer.city}</span>
            </div>
            <span className={`internship-badge ${offer.compensationType}`}>{offer.compensationLabel}</span>
          </header>
          <h3>{offer.title}</h3>
          <div className="internship-meta">
            <span><BriefcaseBusiness size={13} />{offer.trade}</span>
            <span><Clock size={13} />{offer.duration}</span>
            {offer.daysLeft !== null && (
              <span className={`internship-days-left${offer.daysLeft < 7 ? " urgent" : ""}`}>
                <Calendar size={13} />{offer.isExpired ? "Expiré" : `J-${offer.daysLeft}`}
              </span>
            )}
          </div>
        </div>

        <section className="app-section">
          <h2>À propos de l'entreprise</h2>
          <p>{offer.sme?.sector ? `Secteur : ${offer.sme.sector}` : "Informations non disponibles."}</p>
        </section>

        {!offer.isExpired && user && (
          <a
            href={`/apply?offerId=${offer.id}`}
            className="wide-blue-button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
          >
            Postuler à cette offre
          </a>
        )}
        {!user && (
          <a href="/login" className="wide-blue-button" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            Connectez-vous pour postuler
          </a>
        )}
      </div>

      <BottomNav active="internships" mode="worker" />
    </main>
  );
}
