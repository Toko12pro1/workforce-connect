import React from "react";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Camera,
  Home,
  MapPin,
  Send,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";

function BottomNav() {
  return (
    <nav className="app-bottom-nav" aria-label="App navigation">
      <a href="/browse">
        <Home size={20} />
        Home
      </a>
      <a className="active" href="/post-job-details">
        <BriefcaseBusiness size={20} />
        My Jobs
      </a>
      <a href="/worker-profile">
        <UserRound size={20} />
        Profile
      </a>
    </nav>
  );
}

export default function JobVisualsPage() {
  return (
    <main className="app-screen job-visuals-screen">
      <header className="job-flow-header visual-flow-header">
        <a href="/post-job-location" aria-label="Back to location">
          <ArrowLeft size={28} />
        </a>
        <a href="/browse" className="job-flow-brand">
          Workforce Connect
        </a>
        <a href="/worker-dashboard" aria-label="Notifications">
          <Bell size={22} />
        </a>
      </header>

      <section className="visuals-content">
        <div className="job-step-row visuals-step">
          <strong>Step 3 of 3</strong>
          <span>Final Step: Visuals</span>
          <i>
            <b></b>
          </i>
        </div>

        <div className="visuals-title">
          <h1>Show the Work</h1>
          <p>
            Adding clear photos of the job site or items helps providers share
            accurate quotes.
          </p>
        </div>

        <button className="visual-upload-box" type="button">
          <Camera size={58} />
          <span>Add Photos or Video</span>
        </button>

        <div className="visual-preview-grid">
          <article>
            <img
              src="https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=560&q=82"
              alt="Room flooring needing repair"
            />
            <button aria-label="Remove first upload" type="button">
              <X size={20} />
            </button>
          </article>
          <article>
            <img
              src="https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?auto=format&fit=crop&w=560&q=82"
              alt="Wooden floor repair"
            />
            <button aria-label="Remove second upload" type="button">
              <X size={20} />
            </button>
          </article>
        </div>

        <aside className="local-reach-card">
          <span>
            <MapPin size={34} />
          </span>
          <p>
            <strong>Local Reach</strong>
            Your job will be visible to 142 verified providers in{" "}
            <b>Morningside Heights.</b>
          </p>
        </aside>

        <p className="verified-response-note">
          <ShieldCheck size={28} />
          Verified users get 30% more responses
        </p>

        <a className="wide-blue-button post-now-button" href="/job-posted">
          Post Job Now
          <Send size={29} />
        </a>
        <a className="save-draft-button" href="/browse">
          Save as Draft
        </a>
      </section>

      <BottomNav />
    </main>
  );
}
