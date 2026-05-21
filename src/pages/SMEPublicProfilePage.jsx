import React, { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, MapPin } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import InternshipCard from "../components/InternshipCard.jsx";
import { getSMEProfile } from "../services/smeService.js";
import { getOffersBySME } from "../services/internshipService.js";

export default function SMEPublicProfilePage({ id }) {
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getSMEProfile(id), getOffersBySME(id)]).then(([prof, offs]) => {
      setProfile(prof);
      setOffers(offs.filter((o) => o.status === "open"));
    });
  }, [id]);

  if (!profile) {
    return <main className="app-screen"><div className="browse-loading">Chargement…</div></main>;
  }

  return (
    <main className="app-screen profile-screen">
      <header className="portfolio-upload-header">
        <a href="/internships" aria-label="Retour"><ArrowLeft size={28} /></a>
        <h1>Profil PME</h1>
        <span />
      </header>

      <section className="profile-card-main">
        <div className="sme-logo-placeholder large"><BriefcaseBusiness size={40} /></div>
        <h1>{profile.companyName}</h1>
        <h2>{profile.sector}</h2>
        <p><MapPin size={14} />{profile.city}</p>
        <p className="sme-size-label">{profile.sizeLabel}</p>
      </section>

      <section className="app-section">
        <h2>Offres de stage actives</h2>
        {offers.length === 0 ? (
          <p className="browse-empty">Aucune offre active.</p>
        ) : (
          <div className="internship-list">
            {offers.map((offer) => (
              <InternshipCard
                key={offer.id}
                offer={offer}
                onApply={(id) => { window.location.href = `/apply?offerId=${id}`; }}
              />
            ))}
          </div>
        )}
      </section>

      <BottomNav active="internships" mode="worker" />
    </main>
  );
}
