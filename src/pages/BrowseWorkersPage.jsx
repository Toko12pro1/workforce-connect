import React, { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Search, Star, Zap } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { getWorkers } from "../services/workersService.js";
import { useAuth } from "../hooks/useAuth.js";

const TRADES = [
  "All", "Maçonnerie", "Plomberie", "Electricité", "Menuiserie",
  "Couture", "Coiffure", "Mécanique", "Soudure", "Peinture",
  "Carrelage", "Cuisine", "Informatique", "Climatisation",
  "Jardinage", "Agent de sécurité", "Transport"
];

function useDebounce(value, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function BrowseWorkersPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getWorkers({
      search: debouncedSearch,
      category,
      availableOnly
    }).then((data) => {
      setWorkers(data);
      setLoading(false);
    });
  }, [debouncedSearch, category, availableOnly]);

  return (
    <main className="app-screen browse-screen">
      <AppHeader title="Découvrir des pros" rightSlot={<NotificationBell userId={user?.id} />} />

      <section className="browse-content">
        <label className="search-box">
          <Search size={22} />
          <input
            placeholder="Rechercher plombier, couturière, maçon…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" aria-label="Effacer" onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7a99", padding: "4px" }}>
              ✕
            </button>
          )}
        </label>

        <div className="category-scroll" aria-label="Catégories de services">
          {TRADES.map((t) => (
            <button
              key={t}
              type="button"
              className={category === t ? "active" : ""}
              onClick={() => setCategory(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className="availability-filter"
          role="button"
          tabIndex={0}
          onClick={() => setAvailableOnly((v) => !v)}
          onKeyDown={(e) => e.key === "Enter" && setAvailableOnly((v) => !v)}
        >
          <Zap size={20} />
          <strong>Disponibles maintenant</strong>
          <span className={availableOnly ? "toggle-on" : "toggle-off"} />
        </div>

        <div className="worker-results">
          {loading && <p className="browse-loading">Recherche en cours…</p>}
          {!loading && workers.length === 0 && (
            <p className="browse-empty">Aucun prestataire trouvé. Essayez un autre filtre.</p>
          )}
          {workers.map((worker) => (
            <article className="worker-result-card" key={worker.id}>
              <div className="worker-photo">
                <img src={worker.avatarUrl} alt={worker.name} />
                {worker.isAvailable && (
                  <span className="available-pill">Disponible</span>
                )}
              </div>
              <div className="worker-result-body">
                <div>
                  <h2>
                    {worker.name}
                    <BadgeCheck size={18} />
                  </h2>
                  <p>{worker.trade}</p>
                  {worker.location && <small style={{ color: "#6b7a99", fontSize: "0.78rem" }}>{worker.location}</small>}
                </div>
                <div className="worker-meta">
                  <span>
                    <Star size={14} />
                    {worker.rating}
                  </span>
                  {worker.distance && <b>{worker.distance}</b>}
                </div>
                <a className="wide-blue-button" href={`/profile/${worker.id}`}>
                  Voir le profil
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav active="browse" mode="worker" />
    </main>
  );
}
