import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import type { GuideCategory } from "@ffxiv-guide-engine/types";

export type GuideLocaleValue = "tr" | "en";

@Entity({ tableName: "guide" })
export class GuideEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property()
  slug!: string;

  @Enum({ items: () => ["tr", "en"] })
  locale!: GuideLocaleValue;

  @Property()
  title!: string;

  @Property({ type: "text" })
  summary!: string;

  @Property({ type: "text" })
  bodyMarkdown!: string;

  @Property({ nullable: true })
  category?: GuideCategory;

  @Property({ type: "json", nullable: true })
  tags?: string[];

  @Property()
  isPublished = false;

  @Property()
  updatedAt: Date = new Date();
}
