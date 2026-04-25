import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { SourceHealthEntity } from "../../entities/source-health.entity";
import { SourcesController } from "./sources.controller";
import { SourcesService } from "./sources.service";

@Module({
  imports: [MikroOrmModule.forFeature([SourceHealthEntity])],
  controllers: [SourcesController],
  providers: [SourcesService]
})
export class SourcesModule {}
