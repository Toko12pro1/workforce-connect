import React from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  MapPin,
  Wallet,
  X
} from "lucide-react";

export default function JobPostedSuccessPage() {
  return (
    <main className="app-screen job-success-screen">
      <aside className="notification-toast">
        <Bell size={29} />
        <strong>A notification was sent to 12 nearby plumbers.</strong>
        <a href="/browse" aria-label="Dismiss notification">
          <X size={28} />
        </a>
      </aside>

      <section className="success-content">
        <div className="success-icon">
          <CheckCircle2 size={78} />
        </div>
        <h1>Job Posted Successfully!</h1>
        <p>Your request has been broadcast to skilled providers in your area.</p>

        <article className="post-summary-card">
          <header>
            <strong>POST SUMMARY</strong>
            <span>
              <BadgeCheck size={20} />
              Live
            </span>
          </header>
          <div className="summary-body">
            <img
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=82"
              alt="Pipe repair tools"
            />
            <h2>Emergency Pipe Repair</h2>
            <p>
              <MapPin size={26} />
              Industrial Zone, Block C
            </p>
            <p>
              <Wallet size={26} />
              Est. Budget: $150 - $200
            </p>
            <div>
              <span>Plumbing</span>
              <span>Urgent</span>
            </div>
          </div>
        </article>

        <div className="success-actions">
          <a href="/worker-dashboard">
            <BriefcaseBusiness size={28} />
            View My Jobs
          </a>
          <a href="/browse">
            <Home size={27} />
            Back to Home
          </a>
        </div>

        <blockquote>
          "Expect responses from qualified providers within the next 30 minutes."
        </blockquote>
      </section>
    </main>
  );
}
