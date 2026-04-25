import { Body, Controller, ForbiddenException, Headers, Post } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { InternalUpsertGuideDto } from "./dto/internal-upsert-guide.dto";
import { GuidesService } from "./guides.service";

/**
 * Internal ingestion endpoints for the scraper worker.
 */
@SkipThrottle()
@Controller("internal/guides")
export class GuidesInternalController {
  public constructor(private readonly guidesService: GuidesService) {}

  @Post("upsert")
  public upsert(
    @Headers("x-internal-token") token: string | undefined,
    @Body() dto: InternalUpsertGuideDto
  ) {
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected || token !== expected) {
      throw new ForbiddenException();
    }
    return this.guidesService.upsertFromPipeline(dto);
  }
}
