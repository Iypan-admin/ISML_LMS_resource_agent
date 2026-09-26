import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCourseDto {
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
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
