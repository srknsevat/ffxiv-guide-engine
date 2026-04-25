import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class ReportSourceHealthDto {
  @IsString()
  @MinLength(1)
  public sourceKey!: string;

  @IsBoolean()
  public isHealthy!: boolean;

  @IsOptional()
  @IsString()
  public lastError?: string;
}
