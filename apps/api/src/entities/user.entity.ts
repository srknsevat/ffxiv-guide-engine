import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";

export type UserRoleValue = "admin" | "editor" | "user";

@Entity({ tableName: "app_user" })
export class UserEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  passwordHash!: string;

  @Enum({ items: () => ["admin", "editor", "user"] })
  role: UserRoleValue = "user";

  @Property()
  createdAt: Date = new Date();
}
