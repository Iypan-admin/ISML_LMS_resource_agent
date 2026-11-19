import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage: string; // German, French, Spanish, Japanese, Korean, English

  @IsString()
  @IsOptional()
  targetLevel?: string; // A1, A2, B1, B2, N5, N4, TOPIK 1

  @IsString()
  @IsOptional()
  framework?: 'CEFR' | 'JLPT' | 'TOPIK' | 'ACTFL';

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  institutionType?: string; // SCHOOL | COLLEGE | CORPORATE | INDEPENDENT

  // Dynamic Cadence Parameters
  @IsInt()
  @Min(1)
  @Max(52)
  @IsOptional()
  totalWeeks?: number; // e.g. 12, 16, 20

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  periodsPerWeek?: number; // e.g. 2, 3, 5

  @IsInt()
  @Min(20)
  @Max(180)
  @IsOptional()
  periodMinutes?: number; // e.g. 30, 45, 60, 90

  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  customTotalPeriods?: number; // optional exact count override (e.g. 103)

  @IsInt()
  @IsOptional()
  consolidationCadence?: number; // every N-th period
}

export class GroundResourceDto {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsInt()
  @IsOptional()
  pageNumber?: number;

  @IsString()
  @IsOptional()
  citationExcerpt?: string;
}

export class LockCurriculumDto {
  @IsString()
  @IsNotEmpty()
  lockedByUserId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

