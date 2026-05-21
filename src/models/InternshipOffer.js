import { BaseEntity } from "./BaseEntity.js";
import { formatXAF } from "../utils/currency.js";

export class InternshipOffer extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.smeId = row.sme_id ?? null;
    this.title = row.title ?? "";
    this.trade = row.trade ?? "";
    this.city = row.city ?? "";
    this.duration = row.duration ?? "";
    this.compensationType = row.compensation_type ?? "unpaid";
    this.compensationAmount = row.compensation_amount ?? 0;
    this.deadline = row.deadline ? new Date(row.deadline) : null;
    this.status = row.status ?? "open";
    this.applicantsCount = row.applicants_count ?? 0;
    this.sme = row.sme ?? null;
  }

  get compensationLabel() {
    if (this.compensationType === "paid") {
      return `${formatXAF(this.compensationAmount)}/mois`;
    }
    if (this.compensationType === "transport") return "Transport";
    return "Non rémunéré";
  }

  get daysLeft() {
    if (!this.deadline) return null;
    const diff = this.deadline.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  get isExpired() {
    if (!this.deadline) return false;
    return this.deadline.getTime() < Date.now();
  }

  static fromRow(row) {
    return new InternshipOffer(row);
  }
}
