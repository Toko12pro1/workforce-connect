import { UserProfile } from "./UserProfile.js";
import { formatXAF } from "../utils/currency.js";

export class WorkerProfile extends UserProfile {
  constructor(row = {}) {
    super(row);
    this.trade = row.trade ?? "";
    this.skills = row.skills ?? [];
    this.isAvailable = row.is_available ?? true;
    this.rating = row.rating ?? null;
    this.jobsDone = row.jobs_done ?? 0;
    this.weeklyEarnings = row.weekly_earnings ?? 0;
  }

  get earningsFormatted() {
    return formatXAF(this.weeklyEarnings);
  }

  get availabilityLabel() {
    return this.isAvailable ? "Disponible" : "Occupé";
  }

  static fromRow(row) {
    return new WorkerProfile(row);
  }
}
