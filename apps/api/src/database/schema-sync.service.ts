import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";
import * as bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { GuideEntity } from "../entities/guide.entity";
import { UserEntity } from "../entities/user.entity";

/**
 * Optionally updates database schema when SCHEMA_SYNC=true and seeds bootstrap data.
 */
@Injectable()
export class SchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(SchemaSyncService.name);

  public constructor(private readonly orm: MikroORM) {}

  public async onModuleInit(): Promise<void> {
    if (process.env.SCHEMA_SYNC === "true") {
      const generator = this.orm.getSchemaGenerator();
      await generator.ensureDatabase();
      await generator.updateSchema();
      this.logger.log("Database schema synchronized (SCHEMA_SYNC=true).");
    }
    await this.bootstrapAdminIfConfigured();
    await this.seedDemoGuidesIfEnabled();
  }

  private async bootstrapAdminIfConfigured(): Promise<void> {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email || !password) {
      return;
    }
    const em = this.orm.em.fork();
    const adminExists = await em.count(UserEntity, { role: "admin" });
    if (adminExists > 0) {
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = em.create(UserEntity, {
      id: randomUUID(),
      email,
      passwordHash,
      role: "admin",
      createdAt: new Date()
    });
    await em.persistAndFlush(user);
    this.logger.log(`Bootstrap admin created for ${email}.`);
  }

  private async seedDemoGuidesIfEnabled(): Promise<void> {
    if (process.env.SEED_DEMO_GUIDES !== "true") {
      return;
    }
    const em = this.orm.em.fork();
    const count = await em.count(GuideEntity);
    if (count > 0) {
      return;
    }
    const en = em.create(GuideEntity, {
      id: randomUUID(),
      slug: "welcome",
      locale: "en",
      title: "Welcome to FFXIV Guide Engine",
      summary: "Demo guide seeded for local and staging environments.",
      bodyMarkdown: "## Demo\nThis is seeded content.",
      category: "guide",
      tags: ["demo", "welcome"],
      isPublished: true,
      updatedAt: new Date()
    });
    const tr = em.create(GuideEntity, {
      id: randomUUID(),
      slug: "welcome",
      locale: "tr",
      title: "FFXIV Guide Engine'e hoş geldiniz",
      summary: "Yerel ve staging ortamları için örnek rehber.",
      bodyMarkdown: "## Demo\nBu içerik örnek amaçlıdır.",
      category: "guide",
      tags: ["demo", "welcome"],
      isPublished: true,
      updatedAt: new Date()
    });
    await em.persistAndFlush([en, tr]);
    this.logger.log("Demo guides seeded (SEED_DEMO_GUIDES=true).");
  }
}
