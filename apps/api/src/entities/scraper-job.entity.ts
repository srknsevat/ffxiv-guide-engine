import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";

export type ScraperJobStatusValue = "pending" | "running" | "completed" | "failed";

@Entity({ tableName: "scraper_job" })
export class ScraperJobEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property()
  sourceKey!: string;

  @Enum({ items: () => ["pending", "running", "completed", "failed"] })
  status: ScraperJobStatusValue = "pending";

  @Property({ type: "text", nullable: true })
  errorMessage?: string;

  @Property()
  createdAt: Date = new Date();

  @Property()
  updatedAt: Date = new Date();
}
