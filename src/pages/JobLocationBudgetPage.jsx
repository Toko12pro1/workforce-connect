import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Info,
  MapPin,
  Navigation,
  Wallet,
  X
} from "lucide-react";

export default function JobLocationBudgetPage() {
  return (
    <main className="app-screen job-location-screen">
      <header className="job-flow-header">
        <a href="/browse" aria-label="Close job post">
          <X size={25} />
        </a>
        <a href="/browse" className="job-flow-brand">
          Workforce Connect
        </a>
        <a href="/worker-dashboard" aria-label="Notifications">
          <Bell size={22} />
        </a>
      </header>

      <section className="job-flow-content">
        <div className="job-step-row">
          <strong>STEP 2 OF 3</strong>
          <span>Location & Budget</span>
          <i>
            <b></b>
          </i>
        </div>

        <section className="job-block">
          <h1>Where is the work?</h1>
          <label className="job-search-field">
            <span>Quartier ou adresse (Yaoundé / Douala)</span>
            <i>
              <MapPin size={25} />
              <input list="neighbourhoods" placeholder="ex: Bastos, Biyem-Assi, Bonanjo…" />
              <datalist id="neighbourhoods">
                {["Bastos","Biyem-Assi","Mfoundi","Nlongkak","Ekoudou","Essos","Mendong","Santa Barbara","Mvog-Ada","Omnisports","Akwa","Bonanjo","Bali","Makepe","Logbessou","Kotto","Ndokoti","Deido","New Bell","Bonabéri"].map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </i>
          </label>

          <div className="job-map-card">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=82"
              alt="Neighborhood map"
            />
            <MapPin className="map-pin-large" size={88} />
            <button type="button">
              <Navigation size={22} />
              Use My Current Location
            </button>
          </div>
        </section>

        <section className="job-block">
          <h1>Set Your Budget</h1>
          <article className="budget-option active">
            <span>
              <Wallet size={30} />
            </span>
            <div>
              <h2>Fixed Price</h2>
              <p>Pay a set amount for the total job</p>
            </div>
            <b></b>
          </article>

          <label className="amount-card">
            <span>Montant estimé (XAF)</span>
            <i>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6b7a99" }}>XAF</span>
              <input placeholder="0" inputMode="numeric" />
            </i>
          </label>

          <div className="budget-grid">
            <article>
              <Wallet size={24} />
              <h2>Negotiable</h2>
              <p>Discuss price later</p>
            </article>
            <article>
              <Wallet size={24} />
              <h2>Cash on Site</h2>
              <p>Pay in person</p>
            </article>
          </div>

          <aside className="budget-tip">
            <Info size={24} />
            <p>
              Setting a clear budget helps you find qualified providers faster.
              La plupart des travaux de plomberie dans votre zone sont entre 15 000 et 50 000 XAF.
            </p>
          </aside>
        </section>
      </section>

      <footer className="job-flow-actions">
        <a href="/browse">
          <ArrowLeft size={24} />
          Back
        </a>
        <a href="/post-job-visuals">
          Next: Visuals
          <ArrowRight size={25} />
        </a>
      </footer>
    </main>
  );
}
