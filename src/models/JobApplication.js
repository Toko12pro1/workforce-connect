import { BaseEntity } from "./BaseEntity.js";

const STATUS_LABELS = {
  pending: "En attente",
  reviewed: "En cours d'examen",
  accepted: "Accepté",
  rejected: "Refusé"
};

export class JobApplication extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.offerId = row.offer_id ?? null;
    this.applicantId = row.applicant_id ?? null;
    this.coverNote = row.cover_note ?? "";
    this.cvUrl = row.cv_url ?? null;
    this.status = row.status ?? "pending";
    this.offer = row.offer ?? null;
    this.applicant = row.applicant ?? null;
  }

  get statusLabel() {
    return STATUS_LABELS[this.status] ?? this.status;
  }

  static fromRow(row) {
    return new JobApplication(row);
  }
}
