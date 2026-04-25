import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import type { GuideCategory, SupportedLocale } from "@ffxiv-guide-engine/types";

export class InternalUpsertGuideDto {
  @IsString()
  @MinLength(1)
  public slug!: string;

  @IsEnum(["tr", "en"] as const satisfies readonly SupportedLocale[])
  public locale!: SupportedLocale;

  @IsString()
  @MinLength(1)
  public title!: string;

  @IsString()
  public summary!: string;

  @IsString()
  public bodyMarkdown!: string;

  @IsEnum(["patch", "maintenance", "event", "news", "guide", "general"] as const satisfies readonly GuideCategory[])
  @IsOptional()
  public category: GuideCategory = "general";

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public tags: string[] = [];

  @IsBoolean()
  public isPublished = true;
}
