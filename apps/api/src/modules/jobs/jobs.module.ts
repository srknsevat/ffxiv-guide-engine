import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ScraperJobEntity } from "../../entities/scraper-job.entity";
import { JobsController } from "./jobs.controller";
import { JobsInternalController } from "./jobs-internal.controller";
import { JobsService } from "./jobs.service";

@Module({
  imports: [MikroOrmModule.forFeature([ScraperJobEntity])],
  controllers: [JobsController, JobsInternalController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
