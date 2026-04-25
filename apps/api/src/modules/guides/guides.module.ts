import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { GuideEntity } from "../../entities/guide.entity";
import { GuidesController } from "./guides.controller";
import { GuidesInternalController } from "./guides-internal.controller";
import { GuidesService } from "./guides.service";

@Module({
  imports: [MikroOrmModule.forFeature([GuideEntity])],
  controllers: [GuidesController, GuidesInternalController],
  providers: [GuidesService]
})
export class GuidesModule {}
