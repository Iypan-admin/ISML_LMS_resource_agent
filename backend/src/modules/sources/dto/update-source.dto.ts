import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SourceType } from '@prisma/client';

export class UpdateSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsEnum(SourceType)
  @IsOptional()
  sourceType?: SourceType;

  @IsString()
  @IsOptional()
  description?: string;
}
