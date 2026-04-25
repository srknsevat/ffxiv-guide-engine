import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { SupportedLocale } from "@ffxiv-guide-engine/types";
import { Roles } from "../../common/roles.decorator";
import { RolesGuard } from "../../common/roles.guard";
import { CreateGuideDto } from "./dto/create-guide.dto";
import { GuidesService } from "./guides.service";

/**
 * Public guide reads and authenticated guide authoring.
 */
@Controller("guides")
export class GuidesController {
  public constructor(private readonly guidesService: GuidesService) {}

  @Get("admin/test")
  public getAdminTest(): Readonly<{ ok: boolean }> {
    return { ok: true };
  }

  @Get("admin/all")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public listAllForAdmin() {
    return this.guidesService.listAll();
  }

  @Get()
  public listPublished(@Query("locale") locale: SupportedLocale = "en") {
    return this.guidesService.listPublished(locale);
  }

  @Get(":slug")
  public getPublished(@Param("slug") slug: string, @Query("locale") locale: SupportedLocale = "en") {
    return this.guidesService.getPublishedBySlug(slug, locale);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public create(@Body() dto: CreateGuideDto) {
    return this.guidesService.create(dto);
  }

  @Post(":guideId/publish")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin", "editor")
  public publish(@Param("guideId") guideId: string) {
    return this.guidesService.publishById(guideId);
  }
}
