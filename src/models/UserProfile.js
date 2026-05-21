import { BaseEntity } from "./BaseEntity.js";

export class UserProfile extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.name = row.name ?? "";
    this.email = row.email ?? "";
    this.phone = row.phone ?? "";
    this.avatarUrl = row.avatar_url ?? null;
    this.accountType = row.account_type ?? "worker";
    this.location = row.location ?? "";
    this.bio = row.bio ?? "";
    this.cvUrl = row.cv_url ?? null;
    this.followersCount = row.followers_count ?? 0;
    this.followingCount = row.following_count ?? 0;
  }

  get initials() {
    return this.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  get displayRole() {
    const map = { worker: "Travailleur", sme: "PME", client: "Client" };
    return map[this.accountType] ?? "Utilisateur";
  }

  static fromRow(row) {
    return new UserProfile(row);
  }
}
