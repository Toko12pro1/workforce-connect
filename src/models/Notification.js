import { BaseEntity } from "./BaseEntity.js";

const ACTION_LABELS = {
  like: "a aimé votre post",
  comment: "a commenté votre post",
  follow: "vous suit maintenant",
  application: "a postulé à votre offre",
  application_update: "a mis à jour votre candidature"
};

const ICONS = {
  like: "heart",
  comment: "message-circle",
  follow: "user-plus",
  application: "briefcase",
  application_update: "check-circle"
};

export class Notification extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.recipientId = row.recipient_id ?? null;
    this.type = row.type ?? "";
    this.actorId = row.actor_id ?? null;
    this.targetId = row.target_id ?? null;
    this.targetType = row.target_type ?? null;
    this.isRead = row.is_read ?? false;
    this.actor = row.actor ?? null;
  }

  get actionLabel() {
    return ACTION_LABELS[this.type] ?? "a interagi avec vous";
  }

  get icon() {
    return ICONS[this.type] ?? "bell";
  }

  static fromRow(row) {
    return new Notification(row);
  }
}
