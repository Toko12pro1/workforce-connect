import React from "react";
import {
  BriefcaseBusiness,
  Compass,
  Home,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  UserRound,
  Users
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useUnreadMessages } from "../hooks/useUnreadMessages.js";

const WORKER_TABS = [
  { key: "home",     href: "/feed",         icon: <Home size={20} />,          label: "Fil" },
  { key: "browse",   href: "/browse",        icon: <Compass size={20} />,       label: "Découvrir" },
  { key: "post",     href: "/create-post",   icon: <PlusCircle size={24} />,    label: "Publier", center: true },
  { key: "chat",     href: "/chat",          icon: <MessageCircle size={20} />, label: "Messages", badge: true },
  { key: "profile",  href: "/worker-profile",icon: <UserRound size={20} />,     label: "Profil" }
];

const SME_TABS = [
  { key: "dashboard",    href: "/sme-portal",    icon: <LayoutDashboard size={20} />, label: "Tableau de bord" },
  { key: "offers",       href: "/internships",   icon: <BriefcaseBusiness size={20} />, label: "Offres" },
  { key: "post",         href: "/sme-portal",    icon: <PlusCircle size={24} />,    label: "Publier", center: true },
  { key: "chat",         href: "/chat",          icon: <MessageCircle size={20} />, label: "Messages", badge: true },
  { key: "profile",      href: "/worker-profile",icon: <UserRound size={20} />,     label: "Profil" }
];

export default function BottomNav({ active, mode = "worker" }) {
  const { user } = useAuth();
  const unreadMessages = useUnreadMessages(user?.id);
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
          <span className="nav-icon-wrap">
            {tab.icon}
            {tab.badge && unreadMessages > 0 && (
              <span className="nav-unread-dot">{unreadMessages > 9 ? "9+" : unreadMessages}</span>
            )}
          </span>
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
