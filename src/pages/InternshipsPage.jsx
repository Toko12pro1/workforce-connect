import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import InternshipCard from "../components/InternshipCard.jsx";
import { getOffers } from "../services/internshipService.js";
import { useAuth } from "../hooks/useAuth.js";
import NotificationBell from "../components/NotificationBell.jsx";

const COMP_FILTERS = [
  { value: "", label: "Tous" },
  { value: "paid", label: "Rémunéré" },
  { value: "transport", label: "Transport" },
  { value: "unpaid", label: "Non rémunéré" }
];

export default function InternshipsPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compFilter, setCompFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getOffers({
      compensationType: compFilter || undefined
    }).then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, [compFilter]);

  function goApply(offerId) {
    window.location.href = `/apply?offerId=${offerId}`;
  }

  return (
    <main className="app-screen internships-screen">
      <AppHeader title="Offres de stage" rightSlot={<NotificationBell userId={user?.id} />} />

      <div className="internships-filters">
        {COMP_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={compFilter === f.value ? "active" : ""}
            onClick={() => setCompFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="app-section">
        {loading ? (
          <div className="browse-loading">Chargement des offres…</div>
        ) : offers.length === 0 ? (
          <div className="browse-empty">Aucune offre disponible pour le moment.</div>
        ) : (
          <div className="internship-list">
            {offers.map((offer) => (
              <InternshipCard key={offer.id} offer={offer} onApply={goApply} />
            ))}
          </div>
        )}
      </section>

      <BottomNav active="internships" mode={user?.user_metadata?.account_type === "sme" ? "sme" : "worker"} />
    </main>
  );
}
