import { IsString, MinLength } from "class-validator";

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  public sourceKey!: string;
}
