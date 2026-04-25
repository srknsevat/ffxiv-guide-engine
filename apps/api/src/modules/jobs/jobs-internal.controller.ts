import { Body, Controller, ForbiddenException, Headers, Post } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { CompleteJobDto } from "./dto/complete-job.dto";
import { JobsService } from "./jobs.service";

/**
 * Internal scraper endpoints protected by a shared token.
 */
@SkipThrottle()
@Controller("internal/jobs")
export class JobsInternalController {
  public constructor(private readonly jobsService: JobsService) {}

  @Post("claim-next")
  public claimNext(@Headers("x-internal-token") token: string | undefined) {
    this.assertToken(token);
    return this.jobsService.claimNextPending();
  }

  @Post("complete")
  public complete(
    @Headers("x-internal-token") token: string | undefined,
    @Body() dto: CompleteJobDto
  ) {
    this.assertToken(token);
    return this.jobsService.complete({
      jobId: dto.jobId,
      status: dto.status,
      errorMessage: dto.errorMessage
    });
  }

  private assertToken(token: string | undefined): void {
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected || token !== expected) {
      throw new ForbiddenException();
    }
  }
}
