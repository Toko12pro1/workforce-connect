import React, { useEffect, useState } from "react";
import { BriefcaseBusiness, Plus, Users } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import InternshipCard from "../components/InternshipCard.jsx";
import OfferFormPanel from "../components/OfferFormPanel.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { getOffersBySME, createOffer, closeOffer } from "../services/internshipService.js";
import { getApplicationsForOffer, updateApplicationStatus } from "../services/applicationService.js";
import { getSMEProfile } from "../services/smeService.js";
import { useAuth } from "../hooks/useAuth.js";

export default function SMEPortalPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getSMEProfile(user.id), getOffersBySME(user.id)]).then(([prof, offs]) => {
      setProfile(prof);
      setOffers(offs);
      setLoading(false);
    });
  }, [user?.id]);

  useEffect(() => {
    if (selectedOffer) {
      getApplicationsForOffer(selectedOffer.id).then(setApplications);
    }
  }, [selectedOffer]);

  async function handleCreateOffer(data) {
    setError("");
    try {
      const offer = await createOffer(user.id, data);
      setOffers((prev) => [offer, ...prev]);
      setShowForm(false);
    } catch {
      setError("Impossible de publier l'offre. Verifiez Supabase puis reessayez.");
    }
  }

  async function handleStatusUpdate(appId, status) {
    setError("");
    try {
      await updateApplicationStatus(appId, status);
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    } catch {
      setError("Impossible de mettre a jour la candidature.");
    }
  }

  async function handleClose(offerId) {
    setError("");
    try {
      await closeOffer(offerId);
      setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "closed" } : o));
      if (selectedOffer?.id === offerId) setSelectedOffer(null);
    } catch {
      setError("Impossible de fermer cette offre.");
    }
  }

  const openOffers = offers.filter((o) => o.status === "open");
  const closedOffers = offers.filter((o) => o.status !== "open");

  return (
    <main className="app-screen sme-portal-screen">
      <AppHeader
        title={profile?.companyName ?? "Portail PME"}
        rightSlot={<NotificationBell userId={user?.id} />}
      />

      <div className="sme-stats-row">
        <div className="sme-stat">
          <strong>{openOffers.length}</strong>
          <span>Offres actives</span>
        </div>
        <div className="sme-stat">
          <strong>{offers.reduce((s, o) => s + o.applicantsCount, 0)}</strong>
          <span>Candidats total</span>
        </div>
        <div className="sme-stat">
          <strong>{closedOffers.length}</strong>
          <span>Offres fermées</span>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}

      {showForm ? (
        <div className="app-section">
          <OfferFormPanel onSave={handleCreateOffer} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <button className="wide-blue-button sme-new-offer-btn" type="button" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Publier une offre de stage
        </button>
      )}

      {selectedOffer && (
        <section className="app-section">
          <div className="section-row">
            <h2>Candidats — {selectedOffer.title}</h2>
            <button type="button" onClick={() => setSelectedOffer(null)} className="text-btn">Fermer</button>
          </div>
          {applications.length === 0 ? (
            <p className="browse-empty">Aucune candidature pour l'instant.</p>
          ) : (
            <div className="application-list">
              {applications.map((app) => (
                <article className="application-card" key={app.id}>
                  <div className="applicant-info">
                    <div className="sme-logo-placeholder"><Users size={18} /></div>
                    <div>
                      <strong>{app.applicant?.name ?? "Candidat"}</strong>
                      <span>{app.applicant?.trade}</span>
                    </div>
                    <span className={`application-status-badge ${app.status}`}>{app.statusLabel}</span>
                  </div>
                  {app.coverNote && <p className="cover-note-preview">"{app.coverNote.slice(0, 120)}{app.coverNote.length > 120 ? "…" : ""}"</p>}
                  {app.status === "pending" && (
                    <div className="app-action-row">
                      <button type="button" className="accept-btn" onClick={() => handleStatusUpdate(app.id, "accepted")}>Accepter</button>
                      <button type="button" className="reject-btn" onClick={() => handleStatusUpdate(app.id, "rejected")}>Refuser</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="app-section">
        <h2>Mes offres</h2>
        {loading ? (
          <div className="browse-loading">Chargement…</div>
        ) : offers.length === 0 ? (
          <div className="browse-empty">Aucune offre publiée. Commencez par en créer une.</div>
        ) : (
          <div className="internship-list">
            {offers.map((offer) => (
              <div key={offer.id}>
                <InternshipCard offer={offer} onApply={() => setSelectedOffer(offer)} />
                {offer.status === "open" && (
                  <button type="button" className="close-offer-btn" onClick={() => handleClose(offer.id)}>
                    Fermer cette offre
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav active="dashboard" mode="sme" />
    </main>
  );
}
