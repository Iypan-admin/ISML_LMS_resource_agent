import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateLanguageDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nativeName?: string;

  @IsString()
  @IsOptional()
  flagEmoji?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
