import { IsEnum, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { CEFRLevel } from '@prisma/client';

export class CreateLevelDto {
  @IsEnum(CEFRLevel)
  @IsNotEmpty()
  code: CEFRLevel;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  rank: number;
}
