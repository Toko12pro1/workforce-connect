import React, { useEffect, useState } from "react";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { getMyApplications } from "../services/applicationService.js";
import { useAuth } from "../hooks/useAuth.js";
import NotificationBell from "../components/NotificationBell.jsx";

const STATUS_COLORS = {
  pending: "pending",
  reviewed: "reviewed",
  accepted: "accepted",
  rejected: "rejected"
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getMyApplications(user.id).then((data) => {
        setApplications(data);
        setLoading(false);
      });
    }
  }, [user?.id]);

  return (
    <main className="app-screen my-applications-screen">
      <AppHeader title="Mes candidatures" rightSlot={<NotificationBell userId={user?.id} />} />

      <section className="app-section">
        {loading ? (
          <div className="browse-loading">Chargement…</div>
        ) : applications.length === 0 ? (
          <div className="browse-empty">
            <p>Vous n'avez encore postulé à aucune offre.</p>
            <a href="/internships" className="wide-blue-button" style={{ textDecoration: "none", display: "inline-flex", marginTop: 12, justifyContent: "center" }}>
              Découvrir les offres
            </a>
          </div>
        ) : (
          <div className="application-list">
            {applications.map((app) => (
              <article className="application-card" key={app.id}>
                <header>
                  <div className="sme-logo-placeholder"><BriefcaseBusiness size={18} /></div>
                  <div>
                    <strong>{app.offer?.title ?? "Offre"}</strong>
                    <span>{app.offer?.sme?.company_name}</span>
                  </div>
                  <span className={`application-status-badge ${STATUS_COLORS[app.status]}`}>
                    {app.statusLabel}
                  </span>
                </header>
                <div className="application-meta">
                  {app.offer?.city && <span><MapPin size={12} />{app.offer.city}</span>}
                  {app.offer?.trade && <span><BriefcaseBusiness size={12} />{app.offer.trade}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav active="applications" mode="worker" />
    </main>
  );
}
