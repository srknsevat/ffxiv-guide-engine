import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../common/roles.decorator";
import { RolesGuard } from "../../common/roles.guard";
import { CreateJobDto } from "./dto/create-job.dto";
import { JobsService } from "./jobs.service";

/**
 * Scraper job queue API for admin and workers.
 */
@Controller("jobs")
export class JobsController {
  public constructor(private readonly jobsService: JobsService) {}

  @Get("admin/test")
  public getAdminTest(): Readonly<{ ok: boolean }> {
    return { ok: true };
  }

  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public list() {
    return this.jobsService.listRecent();
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public enqueue(@Body() dto: CreateJobDto) {
    return this.jobsService.enqueue(dto);
  }

  @Post(":jobId/retry")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public retry(@Param("jobId") jobId: string) {
    return this.jobsService.retry(jobId);
  }
}
