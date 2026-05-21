import React, { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, MapPin, Phone, Star } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import FollowButton from "../components/FollowButton.jsx";
import { getProfile } from "../services/profileService.js";
import { getPosts } from "../services/portfolioService.js";
import { useAuth } from "../hooks/useAuth.js";
import { WorkerProfile } from "../models/WorkerProfile.js";

export default function PublicWorkerProfilePage({ id }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!id) return;
    getProfile(id).then((data) => {
      if (data) setProfile(WorkerProfile.fromRow({ ...data, avatar_url: data.avatarUrl, is_available: data.isAvailable, jobs_done: data.jobsDone }));
    });
    getPosts(id).then(setPosts);
  }, [id]);

  if (!profile) {
    return <main className="app-screen"><div className="browse-loading">Chargement du profil…</div></main>;
  }

  return (
    <main className="app-screen profile-screen">
      <header className="portfolio-upload-header">
        <a href="/browse" aria-label="Retour"><ArrowLeft size={28} /></a>
        <h1>Profil</h1>
        <span />
      </header>

      <section className="profile-card-main">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">{profile.initials}</div>
        )}
        <h1>{profile.name}</h1>
        {profile.trade && (
          <span className="verified-badge">
            <BadgeCheck size={14} />
            {profile.trade}
          </span>
        )}
        <div className="profile-rating">
          <span>
            <Star size={18} />
            {profile.rating ?? "Nouveau"} <small>({profile.jobsDone} jobs)</small>
          </span>
          <b>{profile.availabilityLabel}</b>
        </div>
        {profile.location && <p><MapPin size={14} />{profile.location}</p>}
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div className="profile-actions">
          <a href={`tel:${profile.phone || ""}`} className="profile-action-btn">
            <Phone size={18} /> Appeler
          </a>
          <a href={`/chat?with=${id}&name=${encodeURIComponent(profile.name)}&avatar=${encodeURIComponent(profile.avatarUrl || "")}`} className="profile-action-btn">
            Message
          </a>
        </div>

        <FollowButton targetId={id} targetType="worker" currentUserId={user?.id} />
      </section>

      {posts.length > 0 && (
        <section className="app-section">
          <h2>Portfolio</h2>
          <div className="portfolio-post-feed">
            {posts.slice(0, 4).map((post) => (
              <article className="portfolio-post-card" key={post.id}>
                {post.image && <img src={post.image} alt={post.title} />}
                <section className="portfolio-post-body">
                  <h3>{post.title}</h3>
                  <p>{post.caption}</p>
                </section>
              </article>
            ))}
          </div>
        </section>
      )}

      <BottomNav active="browse" mode="worker" />
    </main>
  );
}
