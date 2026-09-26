import { IsString, IsOptional } from 'class-validator';

export class UpdateTopicDto {
  @IsString()
  @IsOptional()
  languageId?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentTopicId?: string;
}
