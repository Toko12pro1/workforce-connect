import React from "react";
import {
  BriefcaseBusiness,
  Compass,
  Home,
  LayoutDashboard,
  PlusCircle,
  UserRound,
  Users
} from "lucide-react";

const WORKER_TABS = [
  { key: "home", href: "/feed", icon: <Home size={20} />, label: "Fil" },
  { key: "browse", href: "/browse", icon: <Compass size={20} />, label: "Découvrir" },
  { key: "post", href: "/create-post", icon: <PlusCircle size={24} />, label: "Publier", center: true },
  { key: "internships", href: "/internships", icon: <BriefcaseBusiness size={20} />, label: "Offres" },
  { key: "profile", href: "/worker-profile", icon: <UserRound size={20} />, label: "Profil" }
];

const SME_TABS = [
  { key: "dashboard", href: "/sme-portal", icon: <LayoutDashboard size={20} />, label: "Tableau de bord" },
  { key: "offers", href: "/internships", icon: <BriefcaseBusiness size={20} />, label: "Offres" },
  { key: "post", href: "/sme-portal", icon: <PlusCircle size={24} />, label: "Publier", center: true },
  { key: "applications", href: "/sme-portal", icon: <Users size={20} />, label: "Candidatures" },
  { key: "profile", href: "/worker-profile", icon: <UserRound size={20} />, label: "Profil" }
];

export default function BottomNav({ active, mode = "worker" }) {
  const tabs = mode === "sme" ? SME_TABS : WORKER_TABS;

  return (
    <nav className="app-bottom-nav" aria-label="App navigation">
      {tabs.map((tab) => (
        <a
          key={tab.key}
          href={tab.href}
          className={`${active === tab.key ? "active" : ""}${tab.center ? " nav-center-btn" : ""}`}
          aria-label={tab.label}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
