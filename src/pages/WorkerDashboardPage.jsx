import React from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CirclePlus,
  Plus,
  Star,
  Trophy,
  Wallet,
  Zap
} from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function WorkerDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name || user?.name || "User";

  return (
    <main className="app-screen dashboard-screen">
      <AppHeader title="Workforce Connect" rightSlot={<NotificationBell userId={user?.id} />} />

      <section className="dashboard-content">
        <div className="dashboard-hello">
          <div>
            <h1>Hello, {displayName}</h1>
            <p>Ready to manage your services?</p>
          </div>
          <a href="/worker-profile" className="mini-profile">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80"
              alt={`${displayName} profile`}
            />
            <BadgeCheck size={18} />
          </a>
        </div>

        <article className="availability-card">
          <span>
            <Zap size={34} />
          </span>
          <div>
            <h2>I am available for work</h2>
            <p>People can now book your services instantly</p>
          </div>
          <i></i>
        </article>

        <div className="metric-grid">
          <article className="metric-card">
            <span>
              <BadgeCheck size={24} />
              JOBS DONE
            </span>
            <strong>42</strong>
            <p>+3 this month</p>
          </article>
          <article className="metric-card">
            <span>
              <Star size={24} />
              AVG RATING
            </span>
            <strong>4.9</strong>
            <p>Top 5% User</p>
          </article>
        </div>

        <article className="leaderboard-card">
          <div>
            <span>BASTOS LEADERBOARD</span>
            <h2>#2 <small>in Plumbing</small></h2>
            <p>Only 4 jobs to reach #1</p>
          </div>
          <Trophy size={96} />
        </article>

        <article className="earnings-card">
          <span>
            <Wallet size={30} />
          </span>
          <div>
            <p>EARNINGS THIS WEEK</p>
            <strong className="xaf-amount">85 000 XAF</strong>
          </div>
          <button type="button">Withdraw</button>
        </article>

        <div className="section-row">
          <h2>Your Portfolio</h2>
          <a href="/add-portfolio">
            <CirclePlus size={22} />
            Add New
          </a>
        </div>

        <section className="dashboard-portfolio">
          <article className="large-portfolio">
            <img
              src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=82"
              alt="Copper pipe installation"
            />
            <h3>Hotel Bastos - Main Line</h3>
          </article>
          <img
            src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=420&q=80"
            alt="Bathroom faucet repair"
          />
          <img
            src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=420&q=80"
            alt="Plumbing tools"
          />
        </section>
      </section>

      <a className="floating-add" href="/create-post" aria-label="Add portfolio item">
        <Plus size={32} />
      </a>

      <div className="section-row" style={{ padding: "8px 16px 0" }}>
        <a href="/my-applications" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#0757e9", textDecoration: "none" }}>
          <BriefcaseBusiness size={16} /> Mes candidatures stage
        </a>
        <a href="/feed" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#0757e9", textDecoration: "none" }}>
          Voir le fil &rarr;
        </a>
      </div>

      <BottomNav active="jobs" mode="worker" />
    </main>
  );
}
