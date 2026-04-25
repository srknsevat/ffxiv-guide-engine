import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "source_health" })
export class SourceHealthEntity {
  @PrimaryKey()
  sourceKey!: string;

  @Property()
  isHealthy = true;

  @Property({ type: "text", nullable: true })
  lastError?: string;

  @Property()
  checkedAt: Date = new Date();
}
