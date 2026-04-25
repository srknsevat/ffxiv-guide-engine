import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  UseGuards
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../common/roles.decorator";
import { RolesGuard } from "../../common/roles.guard";
import { ReportSourceHealthDto } from "./dto/report-source-health.dto";
import { SourcesService } from "./sources.service";

/**
 * Source health reporting and admin reads.
 */
@Controller("sources")
export class SourcesController {
  public constructor(private readonly sourcesService: SourcesService) {}

  @Get("admin/test")
  public getAdminTest(): Readonly<{ ok: boolean }> {
    return { ok: true };
  }

  @Get("health")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public listHealth() {
    return this.sourcesService.list();
  }

  @Post("health/report")
  @SkipThrottle()
  public reportHealth(
    @Headers("x-internal-token") token: string | undefined,
    @Body() dto: ReportSourceHealthDto
  ) {
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected || token !== expected) {
      throw new ForbiddenException();
    }
    return this.sourcesService.report(dto);
  }
}
