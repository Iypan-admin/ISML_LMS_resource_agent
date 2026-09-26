import { IsEnum, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { CEFRLevel } from '@prisma/client';

export class UpdateLevelDto {
  @IsEnum(CEFRLevel)
  @IsOptional()
  code?: CEFRLevel;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  rank?: number;
}
