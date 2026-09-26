import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  nativeName: string;

  @IsString()
  @IsOptional()
  flagEmoji?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
