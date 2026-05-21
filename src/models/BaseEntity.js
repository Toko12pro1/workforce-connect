export class BaseEntity {
  constructor(row = {}) {
    this.id = row.id ?? null;
    this.createdAt = row.created_at ? new Date(row.created_at) : new Date();
  }

  toJSON() {
    return { ...this };
  }

  static fromRow(row) {
    return new this(row);
  }
}
