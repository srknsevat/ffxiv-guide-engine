import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { defineConfig } from "@mikro-orm/postgresql";
import { AuthModule } from "./modules/auth/auth.module";
import { GuideEntity } from "./entities/guide.entity";
import { ScraperJobEntity } from "./entities/scraper-job.entity";
import { SourceHealthEntity } from "./entities/source-health.entity";
import { UserEntity } from "./entities/user.entity";
import { GuidesModule } from "./modules/guides/guides.module";
import { HealthModule } from "./modules/health/health.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { SourcesModule } from "./modules/sources/sources.module";
import { UsersModule } from "./modules/users/users.module";
import { SchemaSyncService } from "./database/schema-sync.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    MikroOrmModule.forRoot(
      defineConfig({
        host: process.env.POSTGRES_HOST ?? "localhost",
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        user: process.env.POSTGRES_USER ?? "ffxiv",
        password: process.env.POSTGRES_PASSWORD ?? "ffxiv",
        dbName: process.env.POSTGRES_DB ?? "ffxiv",
        entities: [UserEntity, GuideEntity, ScraperJobEntity, SourceHealthEntity],
        allowGlobalContext: true,
        debug: process.env.NODE_ENV === "development"
      })
    ),
    HealthModule,
    AuthModule,
    UsersModule,
    GuidesModule,
    JobsModule,
    SourcesModule
  ],
  providers: [
    SchemaSyncService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
