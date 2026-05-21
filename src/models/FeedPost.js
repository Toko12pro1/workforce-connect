import { BaseEntity } from "./BaseEntity.js";

export class FeedPost extends BaseEntity {
  constructor(row = {}) {
    super(row);
    this.workerId = row.worker_id ?? null;
    this.title = row.title ?? "";
    this.caption = row.caption ?? "";
    this.postType = row.post_type ?? "Handwork";
    this.category = row.category ?? "";
    this.mediaUrls = row.media_urls ?? [];
    this.mediaTypes = row.media_types ?? [];
    this.likesCount = row.likes_count ?? 0;
    this.commentsCount = row.comments_count ?? 0;
    this.viewsCount = row.views_count ?? 0;
    this.author = row.author ?? null;
  }

  get hasVideo() {
    return this.mediaTypes.some((t) => t === "video");
  }

  get primaryMedia() {
    return this.mediaUrls[0] ?? null;
  }

  get primaryMediaType() {
    return this.mediaTypes[0] ?? "image";
  }

  get relativeTime() {
    const diff = Date.now() - this.createdAt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `${days} j`;
  }

  static fromRow(row) {
    return new FeedPost(row);
  }
}
