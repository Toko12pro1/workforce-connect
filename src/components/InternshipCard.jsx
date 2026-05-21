import React from "react";
import { BriefcaseBusiness, Calendar, Clock, MapPin } from "lucide-react";

export default function InternshipCard({ offer, onApply }) {
  const daysLeft = offer.daysLeft;
  const urgentDeadline = daysLeft !== null && daysLeft < 7;

  return (
    <article className="internship-card">
      <header>
        {offer.sme?.logo_url ? (
          <img src={offer.sme.logo_url} alt={offer.sme.company_name} className="sme-logo-sm" />
        ) : (
          <div className="sme-logo-placeholder">
            <BriefcaseBusiness size={20} />
          </div>
        )}
        <div>
          <strong>{offer.sme?.company_name ?? "Entreprise"}</strong>
          <span>
            <MapPin size={12} />
            {offer.city}
          </span>
        </div>
        <span className={`internship-badge ${offer.compensationType}`}>
          {offer.compensationLabel}
        </span>
      </header>

      <h3>{offer.title}</h3>

      <div className="internship-meta">
        <span>
          <BriefcaseBusiness size={13} />
          {offer.trade}
        </span>
        <span>
          <Clock size={13} />
          {offer.duration}
        </span>
        {daysLeft !== null && (
          <span className={`internship-days-left${urgentDeadline ? " urgent" : ""}`}>
            <Calendar size={13} />
            {offer.isExpired ? "Expiré" : `J-${daysLeft}`}
          </span>
        )}
      </div>

      <footer>
        <span className="applicants-count">{offer.applicantsCount} candidat(s)</span>
        <button
          type="button"
          className="wide-blue-button apply-btn"
          onClick={() => onApply?.(offer.id)}
          disabled={offer.isExpired}
        >
          {offer.isExpired ? "Fermé" : "Postuler"}
        </button>
      </footer>
    </article>
  );
}
