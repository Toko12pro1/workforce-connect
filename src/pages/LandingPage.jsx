import React from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  Menu,
  MonitorSmartphone,
  SearchCheck,
  Star,
  UserRound
} from "lucide-react";

const pros = [
  {
    name: "Samuel O.",
    title: "Certified Electrician",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=720&q=80"
  },
  {
    name: "David M.",
    title: "Master Plumber",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1581092919535-7146ff1a590b?auto=format&fit=crop&w=720&q=80"
  },
  {
    name: "Grace A.",
    title: "Fashion Designer & Tailor",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=720&q=80"
  }
];

function Header() {
  return (
    <header className="topbar">
      <button className="icon-button" aria-label="Open menu">
        <Menu size={16} />
      </button>
      <a href="/">Workforce Connect</a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="trust-badge">
          <CheckCircle2 size={13} />
          Joined by 5,098+ local users
        </div>
        <h1>
          Find Trusted Pros.
          <span>Grow Your Business.</span>
        </h1>
        <p>
          Search for trusted local services and offer your own skills from one
          simple account.
        </p>
        <div className="hero-actions">
          <a href="/browse" className="button primary">
            Search services
          </a>
          <a href="/worker-setup" className="button secondary">
            Offer a service
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats" aria-label="Platform stats">
      <div>
        <strong>5k+</strong>
        <span>Active Pros</span>
      </div>
      <div>
        <strong>12k+</strong>
        <span>Jobs Completed</span>
      </div>
      <div>
        <strong>4.9/5</strong>
        <span>User Rating</span>
      </div>
      <div>
        <strong>24h</strong>
        <span>Avg. Matching</span>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="how">
      <div className="section-heading">
        <h2>How it works</h2>
        <p>Simple steps to professional success.</p>
      </div>

      <div className="steps">
        <article className="step-card">
          <span className="step-number blue">1</span>
          <div>
            <h3>Post a job</h3>
            <p>
              Describe what you need, from plumbing to tailoring. Set your
              budget and timeline in minutes.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=760&q=80"
            alt="A person using a mobile service app"
            className="step-image"
          />
        </article>

        <article className="step-card center">
          <span className="step-number green">2</span>
          <h3>Match with pros</h3>
          <p>
            Our system connects you with verified local talent matching your
            specific needs.
          </p>
          <div className="avatar-row" aria-label="Matched professionals">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </article>

        <article className="step-card done">
          <span className="step-number white">3</span>
          <h3>Get it done</h3>
          <p>
            Hire your favorite pro, track progress, and pay securely through
            the platform only when the job is finished.
          </p>
          <div className="receipt">
            <CheckCircle2 size={20} />
            <div>
              <strong>Project Completed</strong>
              <span>Payment Released</span>
            </div>
            <b>$459</b>
          </div>
        </article>
      </div>
    </section>
  );
}

function VerifiedTalent() {
  return (
    <section className="talent" id="pros">
      <div className="section-copy">
        <h2>Verified Talent</h2>
        <p>
          Every professional on our platform undergoes a rigorous verification
          process to ensure quality and trust.
        </p>
        <a href="/browse">
          View all pros
          <SearchCheck size={16} />
        </a>
      </div>

      <div className="pro-list">
        {pros.map((pro, index) => (
          <article className="pro-card" key={pro.name}>
            <div className="pro-image-wrap">
              <img src={pro.image} alt={`${pro.name}, ${pro.title}`} />
              {index !== 1 && (
                <span className="available">
                  <CheckCircle2 size={11} />
                  Available Now
                </span>
              )}
            </div>
            <div className="pro-info">
              <div>
                <h3>
                  {pro.name}
                  <BadgeCheck size={14} />
                </h3>
                <p>{pro.title}</p>
              </div>
              <span className="rating">
                <Star size={12} fill="currentColor" />
                {pro.rating}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta" id="join">
      <h2>Ready to grow?</h2>
      <p>
        Whether you're looking for quality work or looking to offer your skills,
        Workforce Connect is the place for you.
      </p>
      <a href="/browse" className="button primary">
        Search services
      </a>
      <a href="/worker-setup" className="button dark-secondary">
        Offer a service
      </a>
    </section>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <a className="active" href="/">
        <Home size={15} />
        Home
      </a>
      <a href="/browse">
        <MonitorSmartphone size={15} />
        Inbox
      </a>
      <a href="/worker-dashboard">
        <BriefcaseBusiness size={15} />
        Jobs
      </a>
      <a href="/worker-profile">
        <UserRound size={15} />
        Profile
      </a>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <Header />
      <Hero />
      <Stats />
      <div id="how">
        <HowItWorks />
      </div>
      <VerifiedTalent />
      <CTA />
      <BottomNav />
    </main>
  );
}
