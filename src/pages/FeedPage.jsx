import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FeedSection from "../components/FeedSection.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { getFeed } from "../services/feedService.js";
import { CAMEROON_TRADES } from "../components/TradeChipGrid.jsx";

const ALL_TRADES = ["Tous", ...CAMEROON_TRADES];

function useDebounce(value, ms = 400) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return deb;
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [tradeFilter, setTradeFilter] = useState("Tous");
  const [postTypeFilter, setPostTypeFilter] = useState("");
  const pageRef = useRef(0);

  const debouncedTrade = useDebounce(tradeFilter);
  const debouncedType = useDebounce(postTypeFilter, 0);

  async function loadPage(p, trade, type) {
    setLoading(true);
    const next = await getFeed({
      page: p,
      trade: trade === "Tous" ? undefined : trade,
      postType: type || undefined
    });
    if (next.length < 10) setHasMore(false);
    setPosts((prev) => (p === 0 ? next : [...prev, ...next]));
    setLoading(false);
  }

  // Reload from page 0 when filters change
  useEffect(() => {
    pageRef.current = 0;
    setPage(0);
    setHasMore(true);
    loadPage(0, debouncedTrade, debouncedType);
  }, [debouncedTrade, debouncedType]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = pageRef.current + 1;
      pageRef.current = next;
      setPage(next);
      loadPage(next, debouncedTrade, debouncedType);
    }
  }, [loading, hasMore, debouncedTrade, debouncedType]);

  const activeFilters = (tradeFilter !== "Tous" ? 1 : 0) + (postTypeFilter ? 1 : 0);

  return (
    <main className="app-screen feed-screen" style={{ position: "relative" }}>
      {/* Filter bar overlay at top */}
      <div className="feed-filter-bar">
        <button
          type="button"
          className={`feed-filter-toggle${activeFilters > 0 ? " active" : ""}`}
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filtres"
        >
          <SlidersHorizontal size={18} />
          {activeFilters > 0 && <span className="feed-filter-badge">{activeFilters}</span>}
        </button>

        {showFilters && (
          <div className="feed-filter-panel">
            <div className="feed-filter-row">
              <strong>Métier</strong>
              <div className="feed-filter-chips">
                {ALL_TRADES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={tradeFilter === t ? "active" : ""}
                    onClick={() => setTradeFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="feed-filter-row">
              <strong>Type de post</strong>
              <div className="feed-filter-chips">
                {[["", "Tous"], ["Handwork", "Travail manuel"], ["Job Update", "Actualité"], ["Training", "Formation"]].map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    className={postTypeFilter === val ? "active" : ""}
                    onClick={() => setPostTypeFilter(val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                type="button"
                className="feed-filter-clear"
                onClick={() => { setTradeFilter("Tous"); setPostTypeFilter(""); }}
              >
                <X size={14} /> Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <FeedSection posts={posts} loading={loading} onLoadMore={handleLoadMore} />

      <BottomNav active="home" mode="worker" />
    </main>
  );
}
