import React from "react";
import { MapPin } from "lucide-react";

export default function AppHeader({ title = "Workforce Connect", rightSlot }) {
  return (
    <header className="mobile-app-header">
      <a href="/feed">
        <MapPin size={23} />
        <span>{title}</span>
      </a>
      {rightSlot ?? null}
    </header>
  );
}
