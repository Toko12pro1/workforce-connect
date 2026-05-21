import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Hammer,
  MapPin,
  MoreHorizontal,
  Navigation,
  Paintbrush,
  Scissors,
  Search,
  Wrench
} from "lucide-react";

const trades = [
  { name: "Plumber", icon: Wrench, active: true },
  { name: "Tailor", icon: Hammer },
  { name: "Mechanic", icon: Wrench },
  { name: "Electrician", icon: CircleDot },
  { name: "Painter", icon: Paintbrush },
  { name: "Barber", icon: Scissors },
  { name: "Carpenter", icon: Hammer },
  { name: "Other", icon: MoreHorizontal }
];

export default function WorkerOnboardingPage() {
  return (
    <main className="setup-screen">
      <header className="setup-header">
        <a href="/">Workforce Connect</a>
        <span>Step 1 of 3</span>
      </header>

      <section className="setup-content">
        <article className="setup-hero">
          <img
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=82"
            alt="Construction workers"
          />
          <div>
            <h1>Welcome to Workforce</h1>
            <p>Add your service details and start receiving requests.</p>
          </div>
        </article>

        <section className="setup-block">
          <h2>Your Phone Number</h2>
          <div className="phone-entry">
            <button type="button">+1</button>
            <input placeholder="712 345 678" />
          </div>
          <p>We'll send a code to verify this number.</p>
          <button className="wide-blue-button">
            Next
            <ArrowRight size={23} />
          </button>
        </section>

        <div className="setup-divider"></div>

        <section className="setup-block">
          <h2>Select Your Trade</h2>
          <div className="trade-grid">
            {trades.map(({ name, icon: Icon, active }) => (
              <button className={active ? "active" : ""} key={name} type="button">
                <span>
                  <Icon size={28} />
                </span>
                {name}
              </button>
            ))}
          </div>
          <button className="wide-blue-button">Confirm Selection</button>
        </section>

        <div className="setup-divider"></div>

        <section className="setup-block">
          <h2>Set Location</h2>
          <p>We use your location to show you jobs in your area.</p>
          <div className="map-preview">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=82"
              alt="Map preview"
            />
            <MapPin size={92} />
          </div>
          <button className="outline-location" type="button">
            <Navigation size={20} />
            Use Current Location
          </button>
          <label className="manual-location">
            <Search size={20} />
            <input placeholder="Or enter your area manually" />
          </label>
          <a className="wide-blue-button" href="/worker-dashboard">
            Finish Setup
            <CheckCircle2 size={21} />
          </a>
        </section>
      </section>
    </main>
  );
}
