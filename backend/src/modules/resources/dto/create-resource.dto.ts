import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ResourceType, ResourceStatus, SourceOriginType } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  languageId: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  resourceType: ResourceType;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsEnum(SourceOriginType)
  @IsOptional()
  sourceType?: SourceOriginType;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  @IsString()
  @IsOptional()
  originalUrl?: string;

  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @IsString()
  @IsOptional()
  normalizedUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @IsString()
  @IsOptional()
  publishedLocation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courseIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  levelIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skillIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topicIds?: string[];
}
