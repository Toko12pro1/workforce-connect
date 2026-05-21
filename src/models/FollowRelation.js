import { BaseEntity } from "./BaseEntity.js";

export class FollowRelation extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.followerId = row.follower_id ?? null;
    this.followedId = row.followed_id ?? null;
    this.followedType = row.followed_type ?? "worker";
  }

  static fromRow(row) {
    return new FollowRelation(row);
  }
}
