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
  Users
} from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import FollowButton from "../components/FollowButton.jsx";
import { getPosts } from "../services/portfolioService.js";
import { useAuth } from "../hooks/useAuth.js";

const reviews = [
  {
    name: "Jane Doe",
    when: "2 days ago",
    initials: "JD",
    tone: "blue",
    text: "Fatou did an incredible job with my wedding gown alterations. The fit is perfect and she was so professional throughout the process."
  },
  {
    name: "Moussa K.",
    when: "1 week ago",
    initials: "MK",
    tone: "green",
    text: "Fastest turnaround time in the city. I brought 5 shirts for alterations and they were ready in 24 hours. Excellent craft."
  }
];

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const [portfolioPosts, setPortfolioPosts] = useState([]);

  useEffect(() => {
    getPosts().then(setPortfolioPosts);
  }, []);

  return (
    <main className="app-screen profile-screen">
      <AppHeader title="Workforce Connect" rightSlot={<NotificationBell userId={user?.id} />} />

      <section className="profile-hero">
        <img
          src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=82"
          alt="Tailor working at a sewing machine"
        />
      </section>

      <section className="profile-card-main">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=260&q=80"
          alt="Fatou profile"
          className="profile-avatar"
        />
        <BadgeCheck className="profile-check" size={27} />
        <h1>Fatou's Creations</h1>
        <span className="verified-badge">
          <BadgeCheck size={14} />
          Verified
        </span>
        <h2>Professional Tailor</h2>
        <div className="profile-rating">
          <span>
            <Star size={18} />
            5.0 <small>(128 reviews)</small>
          </span>
          <b>Available Now</b>
        </div>
        <div className="skill-tags">
          <span>Dressmaking</span>
          <span>Alterations</span>
          <span>Embroidery</span>
          <span>Wedding Gowns</span>
        </div>
        <div className="profile-rating" style={{ gap: 16 }}>
          <span><Users size={15} /> 128 abonnés</span>
          <span>42 abonnements</span>
        </div>
        <div className="profile-actions">
          <a href="tel:+237000000000">
            <Phone size={18} />
            Appeler
          </a>
          <a href="/chat">
            <MessageSquareText size={18} />
            WhatsApp
          </a>
        </div>
        <FollowButton targetId="fatou-profile-id" targetType="worker" currentUserId={user?.id} />
      </section>

      <section className="app-section">
        <div className="section-row">
          <h2>Portfolio Feed</h2>
          <a href="/add-portfolio">
            <Plus size={18} />
            Create Post
          </a>
        </div>
        <div className="profile-feed-tabs" aria-label="Portfolio feed filters">
          <button className="active" type="button">All</button>
          <button type="button">Handwork</button>
          <button type="button">Jobs</button>
          <button type="button">Training</button>
        </div>
        <div className="portfolio-post-feed">
          {portfolioPosts.map((post) => (
            <article className="portfolio-post-card" key={post.id}>
              <header>
                <span className="post-type-badge">
                  {post.postType === "Training" ? (
                    <BookOpenCheck size={15} />
                  ) : (
                    <BriefcaseBusiness size={15} />
                  )}
                  {post.postType}
                </span>
                <small>{post.createdAt}</small>
              </header>
              {post.image && <img src={post.image} alt={post.title} />}
              <section className="portfolio-post-body">
                <div>
                  <strong>{post.category}</strong>
                  <span>{post.mediaLabel}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.caption}</p>
              </section>
              <div className="post-engagement-row">
                <button type="button">
                  <Heart size={17} />
                  Like
                </button>
                <a href="/chat">
                  <MessageCircle size={17} />
                  Message
                </a>
              </div>
              <footer className="post-author-card">
                <img src={post.author.avatar} alt={`${post.author.name} profile`} />
                <div>
                  <strong>{post.author.name}</strong>
                  <span>{post.author.service}</span>
                  <small>
                    <MapPin size={13} />
                    {post.author.location}
                  </small>
                </div>
                <b>
                  <Star size={13} />
                  {post.author.rating}
                </b>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="app-section reviews-section">
        <div className="section-row">
          <h2>Recent Reviews</h2>
          <a href="/browse">See all &gt;</a>
        </div>
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
              <span className={`review-avatar ${review.tone}`}>{review.initials}</span>
              <div>
                <header>
                  <div>
                    <strong>{review.name}</strong>
                    <small>{review.when}</small>
                  </div>
                  <span className="review-stars">★★★★★</span>
                </header>
                <p>"{review.text}"</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav active="profile" mode="worker" />
    </main>
  );
}
