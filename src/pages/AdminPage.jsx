import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, LogOut, RefreshCw, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { useAuth } from "../hooks/useAuth.js";

const TABS = ["Utilisateurs", "Posts", "Offres de stage", "Candidatures"];

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ borderTopColor: color }}>
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, offers: 0, applications: 0 });

  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, name, email, account_type")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (profile?.account_type !== "admin") return;
    loadAll();
  }, [profile]);

  async function loadAll() {
    const [u, p, o, a] = await Promise.all([
      supabase.from("profiles").select("id, name, email, account_type, created_at").order("created_at", { ascending: false }),
      supabase.from("feed_posts").select("id, title, category, post_type, likes_count, views_count, created_at, worker_id").order("created_at", { ascending: false }),
      supabase.from("internship_offers").select("id, title, trade, city, status, compensation_type, compensation_amount, deadline, sme_id, created_at").order("created_at", { ascending: false }),
      supabase.from("applications").select("id, offer_id, applicant_id, status, created_at").order("created_at", { ascending: false }),
    ]);
    setUsers(u.data ?? []);
    setPosts(p.data ?? []);
    setOffers(o.data ?? []);
    setApplications(a.data ?? []);
    setStats({
      users: u.data?.length ?? 0,
      posts: p.data?.length ?? 0,
      offers: o.data?.length ?? 0,
      applications: a.data?.length ?? 0,
    });
  }

  function flash(msg) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function changeAccountType(userId, newType) {
    const { error } = await supabase
      .from("profiles")
      .update({ account_type: newType })
      .eq("id", userId);
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, account_type: newType } : u));
      flash(`Rôle mis à jour → ${newType}`);
    }
  }

  async function deletePost(postId) {
    if (!window.confirm("Supprimer ce post définitivement ?")) return;
    const { error } = await supabase.from("feed_posts").delete().eq("id", postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      flash("Post supprimé");
    }
  }

  async function closeOffer(offerId) {
    const { error } = await supabase.from("internship_offers").update({ status: "closed" }).eq("id", offerId);
    if (!error) {
      setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "closed" } : o));
      flash("Offre fermée");
    }
  }

  async function deleteOffer(offerId) {
    if (!window.confirm("Supprimer cette offre ?")) return;
    const { error } = await supabase.from("internship_offers").delete().eq("id", offerId);
    if (!error) {
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      flash("Offre supprimée");
    }
  }

  async function updateApplicationStatus(appId, status) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (!error) {
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
      flash(`Statut → ${status}`);
    }
  }

  if (!user) {
    return (
      <main className="admin-login-wall">
        <ShieldCheck size={48} color="#2563eb" />
        <h1>Espace Administrateur</h1>
        <p>Vous devez être connecté en tant qu'administrateur.</p>
        <a href="/login" className="wide-blue-button" style={{ maxWidth: 280, display: "flex", justifyContent: "center" }}>Se connecter</a>
      </main>
    );
  }

  if (loading) {
    return <div className="app-loading" aria-busy="true" />;
  }

  if (profile?.account_type !== "admin") {
    return (
      <main className="admin-login-wall">
        <AlertTriangle size={48} color="#ef4444" />
        <h1>Accès refusé</h1>
        <p>Votre compte n'a pas les droits administrateur.</p>
        <a href="/feed" className="wide-blue-button" style={{ maxWidth: 240, display: "flex", justifyContent: "center" }}>Retour à l'accueil</a>
      </main>
    );
  }

  return (
    <main className="admin-screen">
      <header className="admin-header">
        <div className="admin-header-brand">
          <ShieldCheck size={24} color="#2563eb" />
          <span>Admin — Workforce Connect</span>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-refresh-btn" onClick={loadAll} title="Rafraîchir">
            <RefreshCw size={17} />
          </button>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={async () => { await signOut(); window.location.href = "/login"; }}
          >
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </header>

      {actionMsg && (
        <div className="admin-action-toast">
          <CheckCircle size={16} /> {actionMsg}
        </div>
      )}

      <section className="admin-stats-row">
        <StatCard label="Utilisateurs" value={stats.users} color="#2563eb" />
        <StatCard label="Posts" value={stats.posts} color="#7c3aed" />
        <StatCard label="Offres" value={stats.offers} color="#059669" />
        <StatCard label="Candidatures" value={stats.applications} color="#d97706" />
      </section>

      <nav className="admin-tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            className={tab === i ? "active" : ""}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </nav>

      <section className="admin-content">
        {tab === 0 && (
          <table className="admin-table">
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || "—"}</td>
                  <td className="admin-email">{u.email}</td>
                  <td>
                    <span className={`admin-role-badge role-${u.account_type}`}>{u.account_type}</span>
                  </td>
                  <td>
                    <select
                      value={u.account_type ?? "worker"}
                      onChange={(e) => changeAccountType(u.id, e.target.value)}
                      className="admin-role-select"
                      disabled={u.id === user.id}
                    >
                      <option value="worker">worker</option>
                      <option value="sme">sme</option>
                      <option value="client">client</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 1 && (
          <table className="admin-table">
            <thead>
              <tr><th>Titre</th><th>Catégorie</th><th>Vues</th><th>Likes</th><th>Action</th></tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{p.views_count ?? 0}</td>
                  <td>{p.likes_count ?? 0}</td>
                  <td>
                    <button type="button" className="admin-delete-btn" onClick={() => deletePost(p.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 2 && (
          <table className="admin-table">
            <thead>
              <tr><th>Titre</th><th>Métier</th><th>Ville</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.title}</td>
                  <td>{o.trade}</td>
                  <td>{o.city}</td>
                  <td>
                    <span className={`admin-status-badge status-${o.status}`}>{o.status}</span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {o.status === "open" && (
                      <button type="button" className="admin-close-btn" onClick={() => closeOffer(o.id)}>
                        Fermer
                      </button>
                    )}
                    <button type="button" className="admin-delete-btn" onClick={() => deleteOffer(o.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <table className="admin-table">
            <thead>
              <tr><th>ID offre</th><th>Candidat</th><th>Statut</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="admin-email">{a.offer_id?.slice(0, 8)}…</td>
                  <td className="admin-email">{a.applicant_id?.slice(0, 8)}…</td>
                  <td>
                    <span className={`admin-status-badge status-${a.status}`}>{a.status}</span>
                  </td>
                  <td>{a.created_at ? new Date(a.created_at).toLocaleDateString("fr-CM") : "—"}</td>
                  <td>
                    <select
                      value={a.status ?? "pending"}
                      onChange={(e) => updateApplicationStatus(a.id, e.target.value)}
                      className="admin-role-select"
                    >
                      <option value="pending">pending</option>
                      <option value="accepted">accepted</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
