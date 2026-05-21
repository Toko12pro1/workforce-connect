import { BaseEntity } from "./BaseEntity.js";

export class PostLike extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.postId = row.post_id ?? null;
    this.userId = row.user_id ?? null;
  }

  static fromRow(row) {
    return new PostLike(row);
  }
}
