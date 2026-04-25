import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CompleteJobDto {
  @IsUUID()
  public jobId!: string;

  @IsEnum(["completed", "failed"] as const)
  public status!: "completed" | "failed";

  @IsOptional()
  @IsString()
  @MinLength(1)
  public errorMessage?: string;
}
