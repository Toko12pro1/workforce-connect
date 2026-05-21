import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  Star,
  Users,
  Zap,
  ZapOff
} from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { getProfileWithStats, setAvailability, updateProfile } from "../services/profileService.js";
import { uploadAvatar } from "../services/storageService.js";
import { supabase } from "../supabaseClient.js";
import { useAuth } from "../hooks/useAuth.js";
import { Camera } from "lucide-react";

const TAB_FILTERS = ["All", "Handwork", "Job Update", "Training"];

function Initials({ name, size = 72 }) {
  const letters = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="profile-avatar profile-avatar-initials"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {letters}
    </div>
  );
}

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("All");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getProfileWithStats(user.id).then((p) => {
      setProfile(p);
      setLoadingProfile(false);
    });
    supabase
      .from("feed_posts")
      .select("id, title, caption, post_type, category, media_urls, likes_count, views_count, created_at")
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data ?? []));
  }, [user?.id]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file, user.id);
      await updateProfile(user.id, { avatarUrl: url });
      setProfile(p => ({ ...p, avatar_url: url }));
    } catch {
      // silently fail — old avatar stays
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function toggleAvailability() {
    if (!profile || togglingAvail) return;
    setTogglingAvail(true);
    const next = !profile.is_available;
    setProfile((p) => ({ ...p, is_available: next }));
    await setAvailability(user.id, next);
    setTogglingAvail(false);
  }

  const filteredPosts =
    tab === "All" ? posts : posts.filter((p) => p.post_type === tab);

  if (!user) {
    return (
      <main className="app-screen">
        <div style={{ padding: 40, textAlign: "center" }}>
          <p>Vous devez être connecté pour voir votre profil.</p>
          <a href="/login" className="wide-blue-button" style={{ maxWidth: 240, marginTop: 16, display: "inline-flex", justifyContent: "center" }}>Se connecter</a>
        </div>
      </main>
    );
  }

  return (
    <main className="app-screen profile-screen">
      <AppHeader title="Workforce Connect" rightSlot={<NotificationBell userId={user?.id} />} />

      <section className="profile-hero">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
          alt="banner"
        />
      </section>

      <section className="profile-card-main">
        <div style={{ position: "relative", display: "inline-block" }}>
          {loadingProfile ? (
            <div className="profile-avatar" style={{ background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span>
            </div>
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="profile-avatar" />
          ) : (
            <Initials name={profile?.name || user?.user_metadata?.name} />
          )}
          <label className="avatar-upload-btn" title="Changer la photo de profil" style={{ opacity: uploadingAvatar ? 0.5 : 1 }}>
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} disabled={uploadingAvatar} />
          </label>
        </div>

        <BadgeCheck className="profile-check" size={27} />
        <h1>{profile?.name || user?.user_metadata?.name || "Mon Profil"}</h1>

        <span className="verified-badge">
          <BadgeCheck size={14} /> Verified
        </span>

        <h2>{profile?.trade || "Travailleur indépendant"}</h2>

        {profile?.rating && (
          <div className="profile-rating">
            <span>
              <Star size={18} />
              {profile.rating}
              {profile.jobs_done > 0 && <small> ({profile.jobs_done} jobs)</small>}
            </span>
            <button
              type="button"
              onClick={toggleAvailability}
              className={`avail-toggle-btn${profile.is_available ? " available" : " busy"}`}
              disabled={togglingAvail}
            >
              {profile.is_available ? <><Zap size={14} /> Disponible</> : <><ZapOff size={14} /> Occupé</>}
            </button>
          </div>
        )}

        {profile?.location && (
          <p style={{ color: "#6b7a99", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 4 }}>
            <MapPin size={13} /> {profile.location}
          </p>
        )}

        {profile?.bio && (
          <p style={{ color: "#475569", fontSize: "0.88rem", textAlign: "center", maxWidth: 340, margin: "8px auto 0" }}>
            {profile.bio}
          </p>
        )}

        {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
          <div className="skill-tags">
            {profile.skills.map((s) => <span key={s}>{s}</span>)}
          </div>
        )}

        <div className="profile-rating" style={{ gap: 16, marginTop: 8 }}>
          <span><Users size={15} /> {profile?.followers_count ?? 0} abonnés</span>
          <span>{profile?.following_count ?? 0} abonnements</span>
        </div>

        <div className="profile-actions">
          {profile?.phone ? (
            <a href={`tel:${profile.phone}`}>
              <Phone size={18} /> Appeler
            </a>
          ) : (
            <a href="/worker-setup">
              <Phone size={18} /> Ajouter tél
            </a>
          )}
          <a href="/chat">
            <MessageSquareText size={18} /> Message
          </a>
        </div>
      </section>

      <section className="app-section">
        <div className="section-row">
          <h2>Portfolio Feed</h2>
          <a href="/create-post">
            <Plus size={18} /> Create Post
          </a>
        </div>
        <div className="profile-feed-tabs" aria-label="Portfolio feed filters">
          {TAB_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>
            <BriefcaseBusiness size={36} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p>Aucun post pour l'instant.</p>
            <a href="/create-post" className="wide-blue-button" style={{ maxWidth: 220, margin: "12px auto 0", display: "flex", justifyContent: "center" }}>
              <Plus size={16} /> Publier un post
            </a>
          </div>
        )}

        <div className="portfolio-post-feed">
          {filteredPosts.map((post) => (
            <article className="portfolio-post-card" key={post.id}>
              <header>
                <span className="post-type-badge">
                  {post.post_type === "Training" ? (
                    <BookOpenCheck size={15} />
                  ) : (
                    <BriefcaseBusiness size={15} />
                  )}
                  {post.post_type}
                </span>
                <small>{post.created_at ? new Date(post.created_at).toLocaleDateString("fr-CM") : ""}</small>
              </header>
              {post.media_urls?.[0] && (
                <img src={post.media_urls[0]} alt={post.title} style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "cover" }} />
              )}
              <section className="portfolio-post-body">
                <div>
                  <strong>{post.category}</strong>
                </div>
                <h3>{post.title}</h3>
                <p>{post.caption}</p>
              </section>
              <div className="post-engagement-row">
                <span>
                  <Heart size={17} /> {post.likes_count ?? 0}
                </span>
                <a href="/chat">
                  <MessageCircle size={17} /> Message
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav active="profile" mode="worker" />
    </main>
  );
}
