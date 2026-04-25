import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * Liveness and smoke endpoints for operations.
 */
@SkipThrottle()
@Controller("health")
export class HealthController {
  @Get()
  public getHealth(): Readonly<{ status: string }> {
    return { status: "ok" };
  }

  @Get("admin/test")
  public getAdminTest(): Readonly<{ ok: boolean }> {
    return { ok: true };
  }
}
