import { BaseEntity } from "./BaseEntity.js";

export class PostComment extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.postId = row.post_id ?? null;
    this.authorId = row.author_id ?? null;
    this.text = row.text ?? "";
    this.likesCount = row.likes_count ?? 0;
    this.author = row.author ?? null;
  }

  get relativeTime() {
    const diff = Date.now() - this.createdAt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h`;
    return `${Math.floor(hrs / 24)} j`;
  }

  static fromRow(row) {
    return new PostComment(row);
  }
}
