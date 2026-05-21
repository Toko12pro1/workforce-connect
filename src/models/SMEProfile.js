import { UserProfile } from "./UserProfile.js";

const SIZE_LABELS = {
  micro: "Micro-entreprise (1–9)",
  petite: "Petite entreprise (10–49)",
  moyenne: "Moyenne entreprise (50–249)"
};

export class SMEProfile extends UserProfile {
  constructor(row = {}) {
    super(row);
    this.companyName = row.company_name ?? row.name ?? "";
    this.sector = row.sector ?? "";
    this.size = row.size ?? "micro";
    this.city = row.city ?? "";
    this.logoUrl = row.logo_url ?? null;
  }

  get sizeLabel() {
    return SIZE_LABELS[this.size] ?? this.size;
  }

  static fromRow(row) {
    return new SMEProfile(row);
  }
}
